<div align="center">

# Codex Image

### 直接在 Codex 中使用 `gpt-image-2` 的技能
### A Codex Skill for Direct `gpt-image-2` Usage

<p>
  <a href="./README.en.md">English</a> ·
  <a href="./README.zh-CN.md">中文扩展说明</a> ·
  <a href="./docs/MANUAL.zh-CN.md">中文手册</a> ·
  <a href="./docs/MANUAL.en.md">English Manual</a>
</p>

<p>
  <strong>建议最好显式使用：</strong> <code>$codex-image</code>
</p>

<p>
  <strong>Recommended best practice:</strong> invoke <code>$codex-image</code> explicitly
</p>

</div>

---

## 中文优先说明

`codex-image` 是一个给 Codex 使用的 skill，用来直接通过 `/responses` 调用 `gpt-image-2`，并把生成结果默认保存到用户 `Pictures/YYYY-MM-DD` 日期目录。

它的核心目标不是“泛化生图”，而是：

- 明确走 `gpt-image-2`
- 明确走 `/responses`
- 明确复用 Codex 本机配置
- 明确把文件落到本地固定日期目录
- 明确支持参考图输入

如果你只记一件事，就是这句：

```text
用 $codex-image 生成一张产品图，默认保存到 Pictures 日期目录。
```

---

## 一键安装

### Windows PowerShell

```powershell
powershell -ExecutionPolicy Bypass -Command "irm https://raw.githubusercontent.com/aEboli/codex-image/main/install.ps1 | iex"
```

### macOS / Linux

```bash
curl -fsSL https://raw.githubusercontent.com/aEboli/codex-image/main/install.sh | bash
```

安装完成后，skill 会落到：

```text
~/.codex/skills/codex-image
```

Windows 通常对应：

```text
C:\Users\<你的用户名>\.codex\skills\codex-image
```

---

## 最佳实践

### 强烈建议显式使用

推荐写法：

```text
用 $codex-image 生成一张蜂蜜产品海报，默认保存到 Pictures 日期目录。
```

或：

```text
Use $codex-image to generate and save a local image with gpt-image-2.
```

为什么最好显式使用：

- 触发最稳定
- 不会和其他图片相关 skill 抢触发
- 能明确告诉 Codex 你要走 `gpt-image-2` 和 `/responses`

---

## 主要能力

- 通过 `/responses` 调用 `gpt-image-2`
- 默认复用 `~/.codex/config.toml`
- 默认复用 `~/.codex/auth.json`
- 支持纯提示词生图
- 支持参考图引导生图
- 默认把结果保存到 `Pictures/YYYY-MM-DD`
- 提供 Node.js CLI 和 PowerShell 包装脚本

---

## 默认输出目录

如果没有显式传 `--output`，脚本会默认保存到：

```text
C:\Users\<你的用户名>\Pictures\YYYY-MM-DD\generated-<timestamp>.<format>
```

仍然可以通过 `--output` 或 `-Output` 覆盖这个默认位置。

---

## 快速使用

### 在 Codex 对话里

```text
用 $codex-image 生成一张竖版产品海报，默认保存到 Pictures 日期目录。
```

### 在终端里

```powershell
powershell -ExecutionPolicy Bypass -File ".\codex-image\scripts\generate-image.ps1" `
  -Prompt "生成一张玻璃蜂蜜罐的干净产品图"
```

---

## 仓库内容

- 技能目录：[`codex-image/`](./codex-image)
- 中文完整手册：[`docs/MANUAL.zh-CN.md`](./docs/MANUAL.zh-CN.md)
- 英文完整手册：[`docs/MANUAL.en.md`](./docs/MANUAL.en.md)
- 中文扩展 README：[`README.zh-CN.md`](./README.zh-CN.md)
- 英文 README：[`README.en.md`](./README.en.md)

---

## English Summary

`codex-image` is a Codex skill for calling `gpt-image-2` through `/responses`, reusing local Codex config/auth, and saving outputs into the user's dated `Pictures` folder by default.

Best practice:

```text
Use $codex-image to generate and save a local image with gpt-image-2.
```

Install:

```bash
curl -fsSL https://raw.githubusercontent.com/aEboli/codex-image/main/install.sh | bash
```

More:

- [English README](./README.en.md)
- [English Manual](./docs/MANUAL.en.md)

---

## License

[MIT](./LICENSE)
