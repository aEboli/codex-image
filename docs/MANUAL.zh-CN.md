# Codex Image 使用手册

## 概述

`codex-image` 是一个专门做一件事的 Codex skill：在 Codex 内通过 Responses API 调用 `gpt-image-2`，并把图片保存到本地工作区。

## 为什么需要这个技能

这个技能适合那些不想走泛化“生图接口”，而是希望路径明确、可检查、可复用的用户。

尤其适合这些情况：

- 明确要用 `gpt-image-2`
- 明确要走 `/responses`
- 明确要把文件落到当前工作区
- 明确要根据参考图出图
- 希望复用 Codex 现有配置和鉴权

## 显式调用

强烈建议显式调用。

推荐写法：

```text
用 $codex-image 生成一张蜂蜜产品竖版海报，并保存到当前工作区。
```

为什么：

1. 触发最稳定。
2. 不容易和其他图片类 skill 混淆。
3. 能更明确地告诉 Codex 你要走 `gpt-image-2` 和 `/responses`。

## 仓库结构

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

## 安装方式

推荐直接一键安装。

### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/aEboli/codex-image/main/install.ps1 | iex"
```

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/aEboli/codex-image/main/install.sh | bash
```

安装后 skill 默认位于：

```text
~/.codex/skills/codex-image
```

如果你想手动安装，也可以把仓库中的 `codex-image/` 目录复制到上面的路径。

## 配置读取顺序

脚本按下面顺序取配置：

1. 命令行参数
2. 环境变量
3. Codex 本机配置
4. 硬编码默认值

Codex 本机配置来源：

- `~/.codex/config.toml`
- `~/.codex/auth.json`

## 支持的调用方式

### 1. 在 Codex 对话里

```text
用 $codex-image 生成一张产品图，并保存到当前工作区。
```

### 2. 用 Node.js CLI

```powershell
node ".\codex-image\scripts\generate-image.mjs" `
  --prompt "生成一张玻璃蜂蜜罐的干净产品图"
```

### 3. 用 PowerShell 包装脚本

```powershell
powershell -ExecutionPolicy Bypass -File ".\codex-image\scripts\generate-image.ps1" `
  -Prompt "生成一张玻璃蜂蜜罐的干净产品图"
```

## 参考图

支持传入一张或多张本地参考图。

示例：

```powershell
powershell -ExecutionPolicy Bypass -File ".\codex-image\scripts\generate-image.ps1" `
  -Prompt "根据参考图生成统一风格的新主视觉" `
  -ReferenceImage "C:\assets\ref-a.png","C:\assets\ref-b.jpg"
```

## 输出行为

- 默认输出路径：`output/generated-<timestamp>.<format>`
- 可以手动覆盖输出路径
- 脚本会打印 `base_url`、模型、API Key 的来源

## 安全说明

- 不要把本机 Codex 鉴权文件提交到仓库
- 不要把真实 API Key 发到聊天里
- 涉及公众人物时，优先做成创意概念图，不要做成伪新闻截图或伪纪实图片

## 验证要求

在宣称可用之前，至少做三步：

1. 校验 skill 结构
2. 跑本地 smoke test
3. 确认输出文件确实存在

## 发布目标

这个仓库的目标 GitHub 名称是 `codex-image`。
