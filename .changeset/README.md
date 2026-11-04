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

Release-mode selection runs alongside package verification and the template
smoke test, so the version PR can open while those checks finish. Publishing
still waits for both full checks on the final `main` commit.

Version PRs from this repository's `changeset-release/main` branch use lighter
checks when their entire diff contains only stable version increases in
publishable package manifests, package changelogs, and deleted changeset files.
Dependency edits, source changes, unexpected files, or an unreadable diff run
the full checks. Both existing check names remain available for branch protection.

Run `pnpm exec vitest run .github/scripts/release-changes.test.mjs` to check this detection.
