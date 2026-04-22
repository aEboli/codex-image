# Codex Image

`codex-image` 是一个给 Codex 使用的技能，用来直接通过 Responses API 调用 `gpt-image-2`，并把最终图片保存到本地工作区。

这个仓库包含：

- 可安装的技能目录 [`codex-image/`](./codex-image)
- 英文完整手册 [`docs/MANUAL.en.md`](./docs/MANUAL.en.md)
- 中文完整手册 [`docs/MANUAL.zh-CN.md`](./docs/MANUAL.zh-CN.md)

## 主要作用

- 通过 `/responses` 调用 `gpt-image-2`
- 复用 Codex 本机 `~/.codex/config.toml` 配置
- 复用 Codex 本机 `~/.codex/auth.json` 鉴权
- 支持纯提示词生图
- 支持参考图引导生图
- 直接把结果保存到当前工作区
- 同时提供 Node.js 入口和 PowerShell 包装脚本

## 最佳实践

建议最好显式使用。

推荐写法：

```text
用 $codex-image 生成一张蜂蜜产品海报，并保存到当前工作区。
```

或者：

```text
Use $codex-image to generate a product image and save it to the current workspace.
```

为什么显式使用更好：

- 触发最稳定
- 不容易和其他图片类 skill 冲突
- 能明确告诉 Codex 你就是要走 `gpt-image-2` + `/responses`

## 安装方式

把 [`codex-image/`](./codex-image) 整个目录复制到：

```text
~/.codex/skills/codex-image
```

Windows 通常对应：

```text
C:\Users\<你的用户名>\.codex\skills\codex-image
```

## 快速使用

在 Codex 对话里：

```text
用 $codex-image 生成一张竖版产品海报，并保存到当前项目 output 目录。
```

在 PowerShell 里：

```powershell
powershell -ExecutionPolicy Bypass -File ".\codex-image\scripts\generate-image.ps1" `
  -Prompt "生成一张玻璃蜂蜜罐的干净产品图"
```

## 文档

- English: [`docs/MANUAL.en.md`](./docs/MANUAL.en.md)
- 中文: [`docs/MANUAL.zh-CN.md`](./docs/MANUAL.zh-CN.md)

## 许可证

[MIT](./LICENSE)
