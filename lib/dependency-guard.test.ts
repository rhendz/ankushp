import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

type DependencyMap = Record<string, unknown>

interface Manifest {
  dependencies?: DependencyMap
  devDependencies?: DependencyMap
  peerDependencies?: DependencyMap
  optionalDependencies?: DependencyMap
  overrides?: DependencyMap
}

const SCOPE_PREFIX = '@react-three/'

const MANIFEST_SECTIONS = [
  'dependencies',
  'devDependencies',
  'peerDependencies',
  'optionalDependencies',
  'overrides',
] as const

/** Every name under a manifest section whose key starts with `@react-three/`. */
function findReactThreePackages(manifest: Manifest): string[] {
  const found: string[] = []
  for (const section of MANIFEST_SECTIONS) {
    const entries = manifest[section]
    if (!entries || typeof entries !== 'object') continue
    for (const name of Object.keys(entries)) {
      if (name.startsWith(SCOPE_PREFIX)) found.push(name)
    }
  }
  return found
}

const repoRoot =
  typeof __dirname === 'string'
    ? resolve(__dirname, '..')
    : process.cwd()

describe('findReactThreePackages', () => {
  it.each(MANIFEST_SECTIONS)('catches a @react-three package in %s', (section) => {
    const manifest: Manifest = { [section]: { '@react-three/fiber': '^9.0.0' } }
    expect(findReactThreePackages(manifest)).toEqual(['@react-three/fiber'])
  })

  it('catches a package in devDependencies by name', () => {
    expect(
      findReactThreePackages({ devDependencies: { '@react-three/drei': '^10.0.0' } }),
    ).toEqual(['@react-three/drei'])
  })

  it('catches an override entry by name', () => {
    expect(
      findReactThreePackages({ overrides: { '@react-three/postprocessing': '3.0.0' } }),
    ).toEqual(['@react-three/postprocessing'])
  })

  it('returns every offender across sections', () => {
    expect(
      findReactThreePackages({
        dependencies: { '@react-three/fiber': '^9.0.0' },
        devDependencies: { '@react-three/drei': '^10.0.0' },
      }),
    ).toEqual(['@react-three/fiber', '@react-three/drei'])
  })

  it('passes a manifest with only three and @types/three', () => {
    expect(
      findReactThreePackages({
        dependencies: { three: '^0.170.0' },
        devDependencies: { '@types/three': '^0.170.0' },
      }),
    ).toEqual([])
  })

  it('does not trip on similarly named packages outside the scope', () => {
    expect(
      findReactThreePackages({
        dependencies: {
          'react-three-fiber': '^8.0.0',
          '@react-three-extras/x': '^1.0.0',
          '@types/react-three': '^1.0.0',
        },
      }),
    ).toEqual([])
  })

  it('passes an empty manifest', () => {
    expect(findReactThreePackages({})).toEqual([])
  })
})

describe('package.json manifest guard', () => {
  it('lists no @react-three package', () => {
    const manifest = JSON.parse(
      readFileSync(resolve(repoRoot, 'package.json'), 'utf8'),
    ) as Manifest
    const offenders = findReactThreePackages(manifest)
    expect(
      offenders,
      `package.json lists @react-three packages: ${offenders.join(', ')}`,
    ).toEqual([])
  })
})
