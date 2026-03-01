# Release Setup Guide

This guide explains how to set up automated releases for the Frontal Cloud SDK using semantic-release.

## Prerequisites

1. **GitHub Repository Permissions**
   - Ensure you have admin access to the repository
   - GitHub Actions must be enabled

2. **NPM Account**
   - Have an NPM account with appropriate permissions
   - Be added as a maintainer for all `@frontal-cloud` packages

## Required GitHub Secrets

Add the following secrets to your GitHub repository settings:

### For NPM Publishing
```
NPM_TOKEN
```
- Your NPM automation token
- Generate at: https://www.npmjs.com/settings/tokens/new
- Required permissions: `read` and `publish`

### For GitHub Releases
```
GITHUB_TOKEN
```
- Automatically provided by GitHub Actions
- No manual setup needed (ensure Actions have write permissions)

### For GitHub App Authentication (if using GitHub App)
```
APP_ID
PRIVATE_KEY
```
- GitHub App ID and private key
- Used for enhanced authentication and team validation

## Setup Steps

### 1. Configure Repository Permissions

Go to your repository settings and ensure:
- **Actions** permissions are enabled
- **Actions** have write access to contents and pull requests
- **Branch protection** is configured for `main` branch

### 2. Add NPM Token

1. Generate an NPM automation token:
   - Visit https://www.npmjs.com/settings/tokens/new
   - Select "Automation" as the token type
   - Give it appropriate permissions

2. Add to GitHub secrets:
   - Go to Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Paste your token

### 3. Configure Branch Protection

For the `main` branch:
- Require pull request reviews
- Require status checks to pass before merging
- Include required checks: `build`, `test`, `lint`

### 4. Test Release Process

1. **Test with a dry run**:
   ```bash
   bun run release:semantic --dry-run
   ```

2. **Manual release** (for testing):
   ```bash
   bun run release:semantic
   ```

## Release Workflow

### Automated Releases (Recommended)

Releases are automatically triggered when:
- Commits are pushed to `main` branch
- The commits follow conventional commit format
- All CI checks pass

### Manual Releases

You can trigger a manual release:
1. Go to Actions tab in GitHub
2. Select "Publish releases" workflow
3. Click "Run workflow"
4. Choose version specifier:
   - `patch` (0.0.1 → 0.0.2)
   - `minor` (0.0.1 → 0.1.0)
   - `major` (0.0.1 → 1.0.0)
   - `pre*` (pre-release versions)

## Conventional Commits

Semantic release analyzes commit messages to determine version bumps:

### Types
- `feat`: New features (minor bump)
- `fix`: Bug fixes (patch bump)
- `BREAKING CHANGE`: Breaking changes (major bump)
- `docs`, `style`, `refactor`, `test`, `chore`: No version bump

### Examples
```bash
feat(storage): add file upload functionality
fix(ai): resolve authentication timeout
BREAKING CHANGE: remove deprecated API methods
docs: update installation guide
```

## Troubleshooting

### Common Issues

1. **NPM Publishing Fails**
   - Check NPM token permissions
   - Verify package name availability
   - Ensure package.json is valid

2. **GitHub Release Fails**
   - Check Actions permissions
   - Verify GITHUB_TOKEN scope

3. **Version Not Incremented**
   - Check commit message format
   - Verify conventional commit compliance
   - Check for duplicate releases

### Debug Commands

```bash
# Check semantic-release configuration
bun run release:semantic --dry-run --debug

# Verify NPM authentication
npm whoami

# Check repository permissions
gh auth status
```

## Release Channels

### Stable Releases
- Triggered on `main` branch
- Published to npm as `latest`
- GitHub release created

### Pre-releases
- Triggered on `beta`/`alpha` branches
- Published to npm with `beta`/`alpha` tag
- GitHub release marked as pre-release

## Monitoring

- **NPM**: https://www.npmjs.com/package/@frontal-cloud/sdk-ts
- **GitHub Releases**: Repository releases tab
- **GitHub Actions**: Actions tab for release workflow status

## Security Considerations

- Never commit secrets to repository
- Rotate NPM tokens regularly
- Use least-privilege principle for tokens
- Monitor release workflow for unauthorized access
