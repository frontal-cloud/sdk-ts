# Releasing Packages

We use [Changesets](https://github.com/changesets/changesets) to manage versioning and publishing of our packages.

## Release Workflow

### 1. Add a Changeset

Every pull request that introduces a user-facing change (feature or fix) should include a changeset file.

```bash
bun run changeset
```

Follow the interactive prompt to:
- Select which packages are affected.
- Choose whether the change is `patch`, `minor`, or `major`.
- Enter a brief description of the change.

### 2. Versioning

When we are ready to release, a maintainer will run:

```bash
bun run version-packages
```

This will:
- Consume the changeset files.
- Update the `package.json` files and `CHANGELOG.md` files for all affected packages.
- Create a commit with the updated versions.

### 3. Publishing

After the versions have been updated and merged into the default branch, the packages can be published to npm:

```bash
bun run release
```

This script will run a build across all packages to ensure they are up-to-date and then publish them.

## Best Practices

- **Atomic Changesets**: Include one changeset per feature or fix.
- **Clear Descriptions**: Write descriptions that are helpful to users in the changelog.
- **CI Integration**: Releases are usually handled via a GitHub Action that monitors the default branch.
