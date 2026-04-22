# Codex Image

`codex-image` is a Codex skill for using `gpt-image-2` directly inside Codex through the Responses API and saving the final image into your local workspace.

This repository contains:

- the installable skill folder at [`codex-image/`](./codex-image)
- an English manual at [`docs/MANUAL.en.md`](./docs/MANUAL.en.md)
- a Chinese manual at [`docs/MANUAL.zh-CN.md`](./docs/MANUAL.zh-CN.md)

## What It Does

- uses `gpt-image-2` through `/responses`
- reuses Codex local config from `~/.codex/config.toml`
- reuses Codex auth from `~/.codex/auth.json`
- supports prompt-only generation and reference-image-guided generation
- saves outputs directly into the current workspace
- provides both a Node.js entrypoint and a PowerShell wrapper

## Best Practice

Explicit invocation is recommended.

Use:

```text
Use $codex-image to generate a product image and save it to the current workspace.
```

or:

```text
用 $codex-image 生成一张产品图，并保存到当前工作区。
```

Why explicit use is better:

- it is the most reliable trigger path
- it avoids overlap with other image-related skills
- it makes it clear that you want `gpt-image-2` plus `/responses`

## Installation

Copy the [`codex-image/`](./codex-image) folder into:

```text
~/.codex/skills/codex-image
```

On Windows this is typically:

```text
C:\Users\<your-user>\.codex\skills\codex-image
```

## Quick Usage

In Codex chat:

```text
Use $codex-image to generate a vertical ad image for a honey product and save it locally.
```

In PowerShell:

```powershell
powershell -ExecutionPolicy Bypass -File ".\codex-image\scripts\generate-image.ps1" `
  -Prompt "Generate a clean product image for a glass honey jar"
```

## Documentation

- English: [`docs/MANUAL.en.md`](./docs/MANUAL.en.md)
- 中文: [`docs/MANUAL.zh-CN.md`](./docs/MANUAL.zh-CN.md)

## License

[MIT](./LICENSE)
