#!/usr/bin/env node

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const REQUIRED_METADATA_FIELDS = ['slug', 'title', 'summary']
const KNOWN_METADATA_FIELDS = ['slug', 'title', 'date', 'lastmod', 'summary']
const ALLOWED_PLACEHOLDER_RE = /^\[\[(IMAGE|MERMAID): [^[\]\n]{1,120}\]\]$/

function printUsage() {
  console.log(`Usage:
  node scripts/blog-handoff-import.mjs validate <input.md> [--scheduled-month YYYY-MM]
  node scripts/blog-handoff-import.mjs import <input.md> [--scheduled-month YYYY-MM] [--out <output.mdx>] [--write] [--force]

Commands:
  validate   Validate collaborator handoff format and content constraints.
  import     Validate, then prepare MDX output for data/blog/<slug>.mdx (dry-run unless --write).`)
}

function parseArgs(argv) {
  const [command, inputPath, ...rest] = argv
  const options = {
    scheduledMonth: null,
    outPath: null,
    write: false,
    force: false,
  }

  for (let i = 0; i < rest.length; i += 1) {
    const arg = rest[i]
    if (arg === '--scheduled-month') {
      options.scheduledMonth = rest[i + 1]
      i += 1
      continue
    }
    if (arg === '--out') {
      options.outPath = rest[i + 1]
      i += 1
      continue
    }
    if (arg === '--write') {
      options.write = true
      continue
    }
    if (arg === '--force') {
      options.force = true
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return { command, inputPath, options }
}

function isValidDateString(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const candidate = new Date(Date.UTC(year, month - 1, day))
  return (
    candidate.getUTCFullYear() === year &&
    candidate.getUTCMonth() === month - 1 &&
    candidate.getUTCDate() === day
  )
}

function normalizeSlug(input, fallbackDate) {
  const safeInput = input ?? ''
  const ascii = safeInput
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split('')
    .filter((char) => char.charCodeAt(0) <= 127)
    .join('')

  let slug = ascii
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  if (slug.length > 80) {
    slug = slug.slice(0, 80).replace(/-+$/g, '')
  }

  if (!slug) {
    const fallback = (fallbackDate || todayDate()).replace(/-/g, '')
    return `untitled-post-${fallback}`
  }

  return slug
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function countSentences(text) {
  const segments = text
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter(Boolean)
  return segments.length
}

function parseMetadataValue(rawValue, lineNumber) {
  const value = rawValue.trim()
  if (!value.startsWith('"') || !value.endsWith('"')) {
    throw new Error(`Line ${lineNumber}: metadata values must be wrapped in double quotes`)
  }
  try {
    return JSON.parse(value)
  } catch {
    throw new Error(`Line ${lineNumber}: invalid quoted string value`)
  }
}

function parseDocument(raw) {
  const errors = []
  const notes = []
  const normalized = raw.replace(/\r\n/g, '\n')

  if (!normalized.startsWith('===METADATA===\n')) {
    return {
      errors: ['Document must begin with "===METADATA===" marker on line 1.'],
      notes,
      metadata: null,
      body: '',
    }
  }

  const endMarker = '\n===END_METADATA===\n'
  const endIndex = normalized.indexOf(endMarker)
  if (endIndex === -1) {
    return {
      errors: ['Missing "===END_METADATA===" marker on its own line.'],
      notes,
      metadata: null,
      body: '',
    }
  }

  const metadataRaw = normalized.slice('===METADATA===\n'.length, endIndex)
  const body = normalized.slice(endIndex + endMarker.length)
  const metadata = {}

  if (!metadataRaw.trim()) {
    errors.push('Metadata block cannot be empty.')
  } else {
    const lines = metadataRaw.split('\n')
    for (let idx = 0; idx < lines.length; idx += 1) {
      const line = lines[idx].trim()
      const lineNumber = idx + 2
      if (!line) continue
      const match = line.match(/^([a-z]+):\s*(.+)$/)
      if (!match) {
        errors.push(`Line ${lineNumber}: invalid metadata entry. Use key: "value" format.`)
        continue
      }

      const [, key, rawValue] = match
      if (!KNOWN_METADATA_FIELDS.includes(key)) {
        errors.push(
          `Line ${lineNumber}: unknown metadata field "${key}". Allowed fields: ${KNOWN_METADATA_FIELDS.join(', ')}.`
        )
        continue
      }
      if (metadata[key] !== undefined) {
        errors.push(`Line ${lineNumber}: duplicate metadata field "${key}".`)
        continue
      }

      try {
        metadata[key] = parseMetadataValue(rawValue, lineNumber)
      } catch (error) {
        errors.push(error.message)
      }
    }
  }

  for (const field of REQUIRED_METADATA_FIELDS) {
    if (!metadata[field]) {
      errors.push(`Missing required metadata field "${field}".`)
    }
  }

  return { errors, notes, metadata, body }
}

function validateContent(parsed, options) {
  const errors = [...parsed.errors]
  const notes = [...parsed.notes]
  const metadata = { ...(parsed.metadata || {}) }
  const body = parsed.body || ''

  if (!metadata.date) {
    if (options.scheduledMonth) {
      if (!/^\d{4}-\d{2}$/.test(options.scheduledMonth)) {
        errors.push('Invalid --scheduled-month value. Use YYYY-MM.')
      } else {
        metadata.date = `${options.scheduledMonth}-15`
        notes.push(`date missing in metadata; defaulted to ${metadata.date} from scheduled month.`)
      }
    } else {
      errors.push(
        'Missing metadata field "date". Provide date explicitly, or run with --scheduled-month YYYY-MM.'
      )
    }
  }

  if (metadata.date && !isValidDateString(metadata.date)) {
    errors.push(`Invalid date "${metadata.date}". Expected YYYY-MM-DD.`)
  }

  if (!metadata.lastmod && metadata.date) {
    metadata.lastmod = metadata.date
    notes.push(`lastmod missing in metadata; defaulted to date (${metadata.date}).`)
  }

  if (metadata.lastmod && !isValidDateString(metadata.lastmod)) {
    errors.push(`Invalid lastmod "${metadata.lastmod}". Expected YYYY-MM-DD.`)
  }

  const fallbackDate = metadata.date || todayDate()
  const normalizedSlug = normalizeSlug(metadata.slug || '', fallbackDate)
  if (metadata.slug && metadata.slug !== normalizedSlug) {
    errors.push(
      `Slug "${metadata.slug}" is not normalized. Expected "${normalizedSlug}" (lowercase ASCII, hyphenated, max 80).`
    )
  }
  metadata.slug = normalizedSlug

  if (metadata.summary) {
    const summary = metadata.summary.trim()
    if (summary.length > 180) {
      errors.push(`Summary is too long (${summary.length} chars). Maximum is 180.`)
    }
    if (/[`*_#[\]<>]/.test(summary)) {
      errors.push('Summary must be plain text only (no markdown or HTML syntax).')
    }
    const sentenceCount = countSentences(summary)
    if (sentenceCount < 1 || sentenceCount > 2) {
      errors.push(`Summary must be 1-2 sentences. Found ${sentenceCount}.`)
    }
  }

  if (!body.trim()) {
    errors.push('Article body is empty.')
    return { errors, notes, metadata, body }
  }

  const bodyWithoutLeadingSpace = body.replace(/^\s*\n/, '')
  if (bodyWithoutLeadingSpace.startsWith('---\n')) {
    errors.push('Frontmatter is not allowed in body. Use only the metadata block markers.')
  }

  const bodyLines = body.split('\n')
  const firstNonEmptyIndex = bodyLines.findIndex((line) => line.trim().length > 0)
  if (firstNonEmptyIndex === -1) {
    errors.push('Article body must contain markdown content.')
  } else {
    const firstLine = bodyLines[firstNonEmptyIndex].trim()
    const expectedH1 = `# ${metadata.title || ''}`.trim()
    if (firstLine !== expectedH1) {
      errors.push(
        `Body must start with H1 matching title. Expected first non-empty line: "${expectedH1}".`
      )
    }
  }

  const joinedBody = bodyLines.join('\n')
  if (/<\/?[A-Za-z][^>]*>/.test(joinedBody)) {
    errors.push('HTML/JSX tags are not allowed in collaborator handoff body.')
  }
  if (/\b(todo|tbd|lorem)\b/i.test(joinedBody)) {
    errors.push('Body cannot contain TODO/TBD/lorem placeholders.')
  }

  for (let i = 0; i < bodyLines.length; i += 1) {
    const trimmed = bodyLines[i].trim()
    if (/^#{1,6}\s*tags\b/i.test(trimmed) || /^tags:\s*/i.test(trimmed)) {
      errors.push(`Line ${i + 1}: tags section is not allowed in handoff content.`)
    }
    if ((trimmed.includes('[[') || trimmed.includes(']]')) && trimmed.length > 0) {
      if (!ALLOWED_PLACEHOLDER_RE.test(trimmed)) {
        errors.push(
          `Line ${i + 1}: invalid placeholder syntax. Allowed: [[IMAGE: short-description]] or [[MERMAID: short-description]] on their own line.`
        )
      }
    }
  }

  return { errors, notes, metadata, body }
}

function escapeSingleQuotes(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function buildMdxOutput(validated) {
  const body = validated.body.replace(/^\n+/, '')
  const { title, date, lastmod, summary } = validated.metadata
  return `---
title: '${escapeSingleQuotes(title)}'
date: '${date}'
lastmod: '${lastmod}'
summary: '${escapeSingleQuotes(summary)}'
---

${body}`
}

function printErrors(errors) {
  console.error('Validation failed with the following issues:')
  errors.forEach((error, idx) => {
    console.error(`${idx + 1}. ${error}`)
  })
}

function main() {
  try {
    const { command, inputPath, options } = parseArgs(process.argv.slice(2))
    if (!command || command === '--help' || command === '-h') {
      printUsage()
      process.exit(0)
    }

    if (!['validate', 'import'].includes(command)) {
      throw new Error(`Unsupported command: ${command}`)
    }
    if (!inputPath) {
      throw new Error('Missing input path.')
    }

    const source = readFileSync(path.resolve(inputPath), 'utf8')
    const parsed = parseDocument(source)
    const validated = validateContent(parsed, options)

    if (validated.errors.length > 0) {
      printErrors(validated.errors)
      process.exit(1)
    }

    console.log('Validation passed.')
    if (validated.notes.length > 0) {
      validated.notes.forEach((note) => console.log(`Note: ${note}`))
    }
    console.log(`Resolved slug: ${validated.metadata.slug}`)
    console.log(`Resolved date: ${validated.metadata.date}`)
    console.log(`Resolved lastmod: ${validated.metadata.lastmod}`)

    if (command === 'validate') {
      process.exit(0)
    }

    const defaultOutPath = path.resolve('data/blog', `${validated.metadata.slug}.mdx`)
    const outPath = path.resolve(options.outPath || defaultOutPath)
    const mdxOutput = buildMdxOutput(validated)

    if (!options.write) {
      console.log(`Dry-run import successful. Output target: ${outPath}`)
      console.log('Re-run with --write to create/update the MDX file.')
      process.exit(0)
    }

    if (existsSync(outPath) && !options.force) {
      throw new Error(`Output file already exists: ${outPath}. Use --force to overwrite.`)
    }

    mkdirSync(path.dirname(outPath), { recursive: true })
    writeFileSync(outPath, mdxOutput, 'utf8')
    console.log(`Wrote ${outPath}`)
  } catch (error) {
    console.error(`Error: ${error.message}`)
    printUsage()
    process.exit(1)
  }
}

main()
