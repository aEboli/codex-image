# Codex Image

`codex-image` is a Codex skill for using `gpt-image-2` directly through `/responses`, with local workspace output and Codex config reuse.

## Recommended Usage

Explicit invocation is strongly recommended:

```text
Use $codex-image to generate and save a local image with gpt-image-2.
```

## Install

### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/aEboli/codex-image/main/install.ps1 | iex"
```

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/aEboli/codex-image/main/install.sh | bash
```

## Why Use It Explicitly

- most reliable trigger path
- avoids overlap with other image-related skills
- makes the `gpt-image-2` plus `/responses` path explicit

## Docs

- Chinese main README: [README.md](./README.md)
- Chinese extended README: [README.zh-CN.md](./README.zh-CN.md)
- English manual: [docs/MANUAL.en.md](./docs/MANUAL.en.md)
- Chinese manual: [docs/MANUAL.zh-CN.md](./docs/MANUAL.zh-CN.md)
