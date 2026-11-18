# homepage-3d-dependency-guard Specification

## Purpose
Keeps the homepage's 3D runtime free of the `@react-three` packages whose React coupling caused the
`ReactCurrentBatchConfig` / `ReactCurrentOwner` errors of GitHub issue 97, by making the site's
unit-test check fail if the package manifest lists one again.

## Requirements

### Requirement: The unit-test check rejects @react-three packages in the manifest

Source: intake.md (Objective; Success criteria, first bullet); decisions.md R1 (issue 97 scope names
`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`).

The site's unit-test check SHALL fail whenever the package manifest lists a package whose name starts
with `@react-three/` in any of its dependency lists (runtime, development, peer, optional) or in its
overrides, and its failure message SHALL name every such package. When no such package is listed,
this check SHALL pass.

#### Scenario: Manifest lists no @react-three package

- **WHEN** the unit-test check runs against the manifest on `main`, which lists no `@react-three/` package
- **THEN** the guard passes

#### Scenario: A runtime dependency from the @react-three scope fails the check

- **WHEN** the manifest's runtime dependencies list `@react-three/fiber`
- **THEN** the guard fails and its message names `@react-three/fiber`

#### Scenario: A development, peer, optional or override entry also fails the check

- **WHEN** the manifest lists `@react-three/drei` only among its development dependencies, or `@react-three/postprocessing` only among its overrides
- **THEN** the guard fails and its message names that package

#### Scenario: A similarly named package outside the scope does not trip the guard

- **WHEN** the manifest lists `three` and `@types/three` but nothing whose name starts with `@react-three/`
- **THEN** the guard passes
