# Changesets

Each file in this folder describes a pending release: which packages it bumps
(patch, minor or major) and the changelog entry. Add one with `pnpm changeset`
whenever you change a publishable package.

Only packages without `"private": true` are versioned and published. To make a
package publishable, remove its `private` flag and set up npm trusted
publishing for it (see `.github/workflows/release.yml`).

On `main`, the Release workflow opens a "Version Packages" pull request from
these files. Merging that pull request publishes the new versions to npm and
creates one git tag and GitHub Release per package, e.g.
`@vinicunca/vite-config@1.1.0`.
