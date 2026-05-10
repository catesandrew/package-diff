---
id: configuration
title: Configuration
sidebar_position: 5
---

# Configuration

`package-diff` stores its configuration and cache files under `~/.package-diff/`.

## Configuration File

Configuration is stored at `~/.package-diff/config.yaml` and can be managed with the `config` command.

### Viewing Configuration

```bash
# Print the full config as YAML
package-diff config

# Read a single key
package-diff config cache.enabled
```

### Setting Values

```bash
package-diff config cache.enabled false
package-diff config cache.min-time 60
package-diff config tui.mode full
```

Values are parsed with best-effort type coercion: `true`/`false` become booleans, numeric strings become numbers, and everything else is stored as a string.

## Configuration Keys

| Key | Default | Description |
|-----|---------|-------------|
| `cache.enabled` | `true` | Enable or disable HTTP response caching |
| `cache.min-time` | `300` | Minimum cache TTL in seconds |
| `cache.max-time` | `86400` | Maximum cache TTL in seconds (24 hours) |
| `tui.mode` | `summary` | Default display mode for the TUI (`summary` or `full`) |

## HTTP Cache

Registry and GitHub API responses are cached on disk under `~/.package-diff/cache/`. This significantly speeds up repeated runs, especially when fetching release notes or release counts from registries.

### How caching works

1. When an HTTP response is received, `package-diff` checks for cache-control headers
2. The TTL from the response headers is clamped to the range `[cache.min-time, cache.max-time]`
3. Cached responses are stored as JSON files in the cache directory
4. On subsequent requests, cached responses are returned if the TTL has not expired

### Disabling the cache

To bypass the cache for a single run, use the `--no-cache` flag:

```bash
package-diff analyse --no-cache
```

To permanently disable caching:

```bash
package-diff config cache.enabled false
```

### Adjusting cache duration

Lower the minimum TTL for more frequent freshness checks:

```bash
package-diff config cache.min-time 60
```

Increase the maximum TTL to keep cached data longer:

```bash
package-diff config cache.max-time 172800
```

## GitHub Authentication

When fetching release notes or repository metadata from GitHub, `package-diff` tries to authenticate to avoid rate limits and access private repositories. Authentication sources are checked in this order:

### 1. `GITHUB_TOKEN` environment variable

The most common method. Set a GitHub personal access token:

```bash
export GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
package-diff changelog react 18.2.0...18.3.1
```

### 2. Local `auth.json` (Composer format)

If an `auth.json` file exists in the current directory with a `github-oauth` section:

```json
{
  "github-oauth": {
    "github.com": "ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

### 3. Global Composer `auth.json`

The file at `~/.composer/auth.json` is checked using the same format as above.

### 4. `COMPOSER_AUTH` environment variable

A JSON string in the same format as `auth.json`:

```bash
export COMPOSER_AUTH='{"github-oauth":{"github.com":"ghp_xxxx"}}'
```

### Rate limits

Without authentication, GitHub API requests are limited to 60 per hour. With a personal access token, the limit increases to 5,000 per hour. If you frequently fetch release notes or run `package-diff` in CI, setting `GITHUB_TOKEN` is recommended.

## Release Notes Resolution

Release notes are resolved in this order (first non-empty result wins):

1. **Local vendor CHANGELOG** -- `CHANGELOG.md` or `CHANGELOG` from the package directory on disk (`node_modules/` or `vendor/`)
2. **GitHub Releases API** -- fetches releases from `/repos/:owner/:repo/releases`
3. **GitHub CHANGELOG.md** -- fetches `CHANGELOG.md` content via the GitHub contents API

The version range for filtering release notes uses exclusive-start, inclusive-end semantics: `from < version <= to`. Use `--include-prerelease` to include prerelease entries when parsing changelogs.
