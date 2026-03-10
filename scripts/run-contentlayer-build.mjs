import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const siteMetadata = require('../data/siteMetadata.js')

const GENERATED_INDEX_PATH = '.contentlayer/generated/index.mjs'
const GENERATED_TAG_DATA_PATH = 'app/blog/tag-data.json'
const GENERATED_SEARCH_INDEX_PATH =
  siteMetadata?.search?.provider === 'kbar' && siteMetadata?.search?.kbarConfig?.searchDocumentsPath
    ? `public/${siteMetadata.search.kbarConfig.searchDocumentsPath}`
    : null

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['cross-env', `INIT_CWD=${process.cwd()}`, 'contentlayer2', 'build'],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  }
)

let stdout = ''
let stderr = ''

const forward = (stream, target) => {
  stream.on('data', (chunk) => {
    const text = chunk.toString()
    if (target === process.stdout) {
      stdout += text
    } else {
      stderr += text
    }
  })
}

forward(child.stdout, process.stdout)
forward(child.stderr, process.stderr)

function sanitizeOutput(output, { suppressKnownExitBug = false } = {}) {
  let sanitized = output
    .replace(/^\(node:\d+\) \[DEP0040\][^\n]*\n?/gm, '')
    .replace(
      /^\(Use `node --trace-deprecation \.\.\.` to show where the warning was created\)\n?/gm,
      ''
    )
    .replace(/^successCallback[^\n]*\n?/gm, '')

  if (suppressKnownExitBug) {
    sanitized = sanitized.replace(
      /TypeError: The "code" argument must be of type number\.[\s\S]*?code: 'ERR_INVALID_ARG_TYPE'\s*\}\n?/g,
      ''
    )
  }

  return sanitized
}

child.on('exit', (code) => {
  const combinedOutput = `${stdout}\n${stderr}`
  const generatedArtifacts = [
    GENERATED_INDEX_PATH,
    GENERATED_TAG_DATA_PATH,
    GENERATED_SEARCH_INDEX_PATH,
  ].filter(Boolean)
  const missingArtifacts = generatedArtifacts.filter((artifactPath) => !existsSync(artifactPath))
  const hasGeneratedArtifacts = missingArtifacts.length === 0
  const hasKnownExitBug =
    combinedOutput.includes('Generated ') &&
    combinedOutput.includes('documents in .contentlayer') &&
    combinedOutput.includes('ERR_INVALID_ARG_TYPE')

  process.stdout.write(
    sanitizeOutput(stdout, { suppressKnownExitBug: hasKnownExitBug && hasGeneratedArtifacts })
  )
  process.stderr.write(
    sanitizeOutput(stderr, { suppressKnownExitBug: hasKnownExitBug && hasGeneratedArtifacts })
  )

  if (code === 0 || (hasKnownExitBug && hasGeneratedArtifacts)) {
    if (hasKnownExitBug) {
      process.stdout.write(
        `Contentlayer completed successfully. Verified artifacts: ${generatedArtifacts.join(', ')}\n`
      )
    }
    process.exit(0)
  }

  if (missingArtifacts.length > 0) {
    process.stderr.write(
      `Contentlayer build did not produce required artifacts: ${missingArtifacts.join(', ')}\n`
    )
  }

  process.exit(code ?? 1)
})
