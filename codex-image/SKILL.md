---
name: codex-image
description: Use Codex directly with `gpt-image-2` through the Responses API and save images into the current workspace. Prefer explicit invocation with `$codex-image`. Use when the user mentions `gpt-image-2`, `Responses API`, `POST /responses`, reference-image-guided generation, Codex config reuse, local output paths, or a reproducible local CLI workflow. Typical Chinese triggers include “用 $codex-image 生图”, “用 Codex 配置直接调用 gpt-image-2”, “根据参考图出图”, “保存到 output 目录”, and “不要走普通 images API”.
---

# Codex Image

用这个 skill 在 Codex 里直接调用 `gpt-image-2`，默认复用 Codex 本机配置，并把最终图片保存到当前工作区。

## Preferred Invocation

优先显式使用 `$codex-image`。

原因：

- 显式调用最稳定，不会和其他图片相关 skill 争抢触发。
- 你的意图会更清楚：就是要走 `gpt-image-2` + `/responses`。
- 当工作区里同时有 `imagegen` 或其他图像类 skill 时，显式调用更可控。

推荐说法：

- `用 $codex-image 生成一张极简风产品海报，保存到当前项目 output 目录。`
- `Use $codex-image to generate a vertical product image with gpt-image-2 and save it locally.`

## Quick Start

1. Confirm `node --version` is 20 or newer.
2. Prefer Codex config first: read `~/.codex/config.toml` for `base_url` and model, and `~/.codex/auth.json` for the API key.
3. Run `scripts/generate-image.mjs` or `scripts/generate-image.ps1`.
4. Pass `--prompt` or `-Prompt`, plus `--reference-image` or `-ReferenceImage` when needed.
5. Verify the saved file exists before you report success.

## When To Use

- 用户明确要在 Codex 里直接使用 `gpt-image-2`
- 用户明确提到 `Responses API`、`POST /responses`、代理 `base-url`
- 用户要根据参考图生成
- 用户要把图片直接保存到当前工作区
- 用户要一个可复用、可审计、可脚本化的本地 CLI 路径

## When Not To Use

- 用户只是普通地说“帮我生成一张图”，且不关心底层 API 路线
- 用户更适合走内置 `imagegen` 的默认工作流
- 用户要编辑现有 SVG、图标系统或代码原生资源，而不是生成位图

## Workflow

1. Extract or refine the prompt.
2. Decide the output path. Default to `output/generated-<timestamp>.<format>`.
3. Add reference images when the request depends on them.
4. Let the script auto-resolve API key, base URL, outer model, and reasoning effort from Codex config unless the user explicitly overrides them.
5. Run the script.
6. Wait for the `已保存图片:` line.
7. Confirm the file exists and report the saved path plus config source.

## Direct Commands

Node.js:

```powershell
node "<skill-dir>\\scripts\\generate-image.mjs" `
  --prompt "生成一张极简风测试海报，蓝白配色，无文字"
```

PowerShell wrapper:

```powershell
powershell -ExecutionPolicy Bypass -File "<skill-dir>\\scripts\\generate-image.ps1" `
  -Prompt "生成一张极简风测试海报，蓝白配色，无文字"
```

With references:

```powershell
powershell -ExecutionPolicy Bypass -File "<skill-dir>\\scripts\\generate-image.ps1" `
  -Prompt "根据参考图生成统一风格的新主视觉" `
  -ReferenceImage "C:\\path\\to\\reference-1.png","C:\\path\\to\\reference-2.jpg"
```

## References

- Read [references/configuration.md](references/configuration.md) for config precedence and examples.
- See the repository root manuals for installation and full English/Chinese documentation.
