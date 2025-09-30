// scripts/patch-contentlayer-json-imports.mjs
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

const root = '.contentlayer/generated'
const RE_A = /assert\s*\{\s*type:\s*'json'\s*\}/g
const RE_B = /assert\s*\{\s*type:\s*"json"\s*\}/g

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) walk(p)
    else if (s.isFile() && p.endsWith('.mjs')) {
      const src = readFileSync(p, 'utf8')
      if (RE_A.test(src) || RE_B.test(src)) {
        const out = src
          .replace(RE_A, "with { type: 'json' }")
          .replace(RE_B, 'with { type: "json" }')
        writeFileSync(p, out, 'utf8')
        console.log('Patched:', p)
      }
    }
  }
}

try {
  walk(root)
} catch (e) {
  // no-op if folder doesn't exist yet
}
