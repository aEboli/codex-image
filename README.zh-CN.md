# Codex Image 中文扩展说明

## 定位

`codex-image` 不是一个“随便生图”的包装，而是一个专门把 Codex、`gpt-image-2`、`/responses`、本地工作区输出这条链路固定下来的 skill。

适合这些用户：

- 想在 Codex 里直接用 `gpt-image-2`
- 想走 `/responses` 而不是其他路径
- 想复用 Codex 本机配置和 auth
- 想要明确的本地落盘结果
- 想保留参考图输入能力

## 最好显式使用

强烈建议这样写：

```text
用 $codex-image 生成一张产品图，并保存到当前工作区。
```

不要太依赖隐式触发，因为显式调用：

1. 更稳定
2. 更清晰
3. 更不容易和其他图像 skill 混淆

## 访客安装命令

### Windows

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/aEboli/codex-image/main/install.ps1 | iex"
```

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/aEboli/codex-image/main/install.sh | bash
```

## 本地调用

### Codex 对话

```text
用 $codex-image 生成一张蜂蜜产品海报，并保存到当前项目 output 目录。
```

### PowerShell

```powershell
powershell -ExecutionPolicy Bypass -File ".\codex-image\scripts\generate-image.ps1" `
  -Prompt "生成一张玻璃蜂蜜罐的干净产品图"
```

### Node.js

```powershell
node ".\codex-image\scripts\generate-image.mjs" `
  --prompt "生成一张玻璃蜂蜜罐的干净产品图"
```

## 文档入口

- 中文主首页：[README.md](./README.md)
- 中文手册：[docs/MANUAL.zh-CN.md](./docs/MANUAL.zh-CN.md)
- 英文说明：[README.en.md](./README.en.md)
- 英文手册：[docs/MANUAL.en.md](./docs/MANUAL.en.md)
