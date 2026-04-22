# Codex Image Configuration

## Explicit Use Recommendation

最好显式使用 `$codex-image`。

为什么：

1. 更稳定。
2. 更容易命中 `gpt-image-2` + `/responses` 这条路径。
3. 更容易和其他图片类 skill 区分。

## Scope

- This skill is for local CLI image generation inside Codex.
- It reuses the Responses API `image_generation` pattern and extracts the final image from SSE events.
- It is not the browser workbench project.

## Configuration Precedence

The scripts resolve settings in this order:

1. CLI arguments
2. Environment variables
3. Local Codex config
4. Hardcoded defaults

Default Codex config location:

- `CODEX_HOME`
- falls back to `~/.codex`

## API Key Precedence

1. `RESPONSES_API_KEY`
2. `OPENAI_API_KEY`
3. `ASXS_API_KEY`
4. `~/.codex/auth.json` -> `OPENAI_API_KEY`

## Base URL Precedence

1. `RESPONSES_BASE_URL`
2. `OPENAI_BASE_URL`
3. `ASXS_BASE_URL`
4. `~/.codex/config.toml` -> current provider `base_url`
5. `https://api.openai.com/v1`

## Outer Model Precedence

1. `RESPONSES_MODEL`
2. `~/.codex/config.toml` -> `model`
3. `gpt-4.1-mini`

## Reasoning Effort Precedence

1. `RESPONSES_REASONING_EFFORT`
2. `~/.codex/config.toml` -> `model_reasoning_effort`
3. omitted

## Supported CLI Parameters

- `--prompt`
- `--reference-image`
- `--size`
- `--quality`
- `--format`
- `--background`
- `--output`
- `--base-url`
- `--model`
- `--reasoning-effort`
- `--codex-home`

## PowerShell Wrapper Parameters

- `-Prompt`
- `-ReferenceImage`
- `-Size`
- `-Quality`
- `-Format`
- `-Background`
- `-Output`
- `-BaseUrl`
- `-Model`
- `-ReasoningEffort`
- `-CodexHome`

## Command Examples

Direct Node.js call:

```powershell
node "<skill-dir>\\scripts\\generate-image.mjs" `
  --prompt "生成一张极简风海报，白底，单个产品主体"
```

Direct PowerShell call:

```powershell
powershell -ExecutionPolicy Bypass -File "<skill-dir>\\scripts\\generate-image.ps1" `
  -Prompt "生成一张极简风海报，白底，单个产品主体"
```

With reference images:

```powershell
powershell -ExecutionPolicy Bypass -File "<skill-dir>\\scripts\\generate-image.ps1" `
  -Prompt "根据参考图生成统一风格的新主视觉" `
  -ReferenceImage "C:\\assets\\ref-a.png","C:\\assets\\ref-b.jpg"
```

Override base URL and model:

```powershell
powershell -ExecutionPolicy Bypass -File "<skill-dir>\\scripts\\generate-image.ps1" `
  -Prompt "生成一张电商直播主图" `
  -BaseUrl "https://api.asxs.top/v1" `
  -Model "gpt-5.4"
```
