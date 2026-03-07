import { spawn } from 'node:child_process'
import { existsSync } from 'node:fs'

const child = spawn(
  process.platform === 'win32' ? 'npx.cmd' : 'npx',
  ['cross-env', `INIT_CWD=${process.cwd()}`, 'contentlayer', 'build'],
  {
    cwd: process.cwd(),
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  }
)

let combinedOutput = ''

const forward = (stream, target) => {
  stream.on('data', (chunk) => {
    const text = chunk.toString()
    combinedOutput += text
    target.write(text)
  })
}

forward(child.stdout, process.stdout)
forward(child.stderr, process.stderr)

child.on('exit', (code) => {
  const generatedIndexPath = '.contentlayer/generated/index.mjs'
  const generatedTagDataPath = 'app/blog/tag-data.json'
  const hasGeneratedArtifacts =
    existsSync(generatedIndexPath) && existsSync(generatedTagDataPath)
  const hasKnownExitBug =
    combinedOutput.includes('Generated ') &&
    combinedOutput.includes('documents in .contentlayer') &&
    combinedOutput.includes('ERR_INVALID_ARG_TYPE')

  if (code === 0 || (hasKnownExitBug && hasGeneratedArtifacts)) {
    process.exit(0)
  }

  process.exit(code ?? 1)
})
