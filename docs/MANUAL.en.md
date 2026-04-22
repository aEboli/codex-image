# Codex Image Manual

## Overview

`codex-image` is a Codex skill focused on one job: use `gpt-image-2` through the Responses API from inside Codex and save the output locally.

## Why This Skill Exists

This skill exists for users who want a predictable, inspectable path instead of a generic image-generation abstraction.

It is especially useful when you want:

- `gpt-image-2` specifically
- `/responses` specifically
- direct workspace output files
- reference-image-based generation
- reuse of existing Codex config and auth

## Explicit Invocation

Explicit invocation is strongly recommended.

Recommended:

```text
Use $codex-image to generate a vertical ad image for a honey product and save it to the current workspace.
```

Why:

1. It is the most reliable trigger.
2. It reduces ambiguity with other image-related skills.
3. It makes the model choice and API path clearer.

## Repository Layout

```text
codex-image-2026-04-23/
├─ README.md
├─ README.zh-CN.md
├─ LICENSE
├─ .gitignore
├─ docs/
│  ├─ MANUAL.en.md
│  └─ MANUAL.zh-CN.md
└─ codex-image/
   ├─ SKILL.md
   ├─ agents/openai.yaml
   ├─ references/configuration.md
   └─ scripts/
      ├─ codex-config.mjs
      ├─ generate-image.mjs
      ├─ generate-image.ps1
      └─ responses-workflow.mjs
```

## Installation

Copy the `codex-image/` folder into your Codex skills directory:

```text
~/.codex/skills/codex-image
```

## Configuration Resolution

The scripts resolve settings in this order:

1. CLI arguments
2. Environment variables
3. Codex local config
4. Hardcoded defaults

Codex local config sources:

- `~/.codex/config.toml`
- `~/.codex/auth.json`

## Supported Usage Modes

### 1. Codex chat

```text
Use $codex-image to generate a product image and save it locally.
```

### 2. Node.js CLI

```powershell
node ".\codex-image\scripts\generate-image.mjs" `
  --prompt "Generate a clean product shot of a glass honey jar"
```

### 3. PowerShell wrapper

```powershell
powershell -ExecutionPolicy Bypass -File ".\codex-image\scripts\generate-image.ps1" `
  -Prompt "Generate a clean product shot of a glass honey jar"
```

## Reference Images

You can pass one or more local reference images.

PowerShell example:

```powershell
powershell -ExecutionPolicy Bypass -File ".\codex-image\scripts\generate-image.ps1" `
  -Prompt "Generate a new product KV using the style of these references" `
  -ReferenceImage "C:\assets\ref-a.png","C:\assets\ref-b.jpg"
```

## Output Behavior

- Default output path: `output/generated-<timestamp>.<format>`
- You can override the output path manually
- The script reports where `base_url`, model, and API key came from

## Safety Notes

- Do not commit local Codex auth files into any repository.
- Do not paste real API keys into chat.
- Use public-figure prompts as creative concepts, not fake documentary images or fake news screenshots.

## Validation

Before calling the skill complete:

1. validate the skill folder
2. run a local smoke test
3. confirm that the output file exists

## Publishing

This repository is intended to be publishable as a GitHub repo named `codex-image`.
