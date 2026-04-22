import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, dirname, extname, resolve } from "node:path";

import { readCodexRuntimeConfig } from "./codex-config.mjs";
import {
  DEFAULT_IMAGE_MODEL,
  normalizeBase64,
  requestImageGeneration,
} from "./responses-workflow.mjs";

const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_MODEL = "gpt-4.1-mini";
const DEFAULT_SIZE = "1024x1536";
const DEFAULT_QUALITY = "high";
const DEFAULT_FORMAT = "jpeg";
const DEFAULT_BACKGROUND = "opaque";
const MAX_REFERENCE_IMAGES = 6;

function printHelp() {
  console.log(`用法:
  node scripts/generate-image.mjs --prompt "生成一张品牌海报"

推荐:
  在 Codex 对话里优先显式使用 $codex-image
  然后再由 Codex 调用本脚本

可选参数:
  --prompt             提示词，必填
  --reference-image    本地参考图路径，可重复传入，最多 6 张
  --size               图片尺寸，默认 ${DEFAULT_SIZE}
  --quality            图片质量，默认 ${DEFAULT_QUALITY}
  --format             输出格式，默认 ${DEFAULT_FORMAT}
  --background         背景模式，默认 ${DEFAULT_BACKGROUND}
  --output             输出文件路径，默认 output/generated-<timestamp>.<format>
  --base-url           接口根路径，优先级：命令行 > 环境变量 > Codex config > ${DEFAULT_BASE_URL}
  --model              外层 Responses 模型，优先级：命令行 > 环境变量 > Codex config > ${DEFAULT_MODEL}
  --reasoning-effort   可选推理强度，不传则不发送 reasoning 字段
  --codex-home         指定 Codex 配置目录，默认读取 CODEX_HOME 或 ~/.codex
  --help, -h           显示帮助

环境变量或 Codex 配置:
  API Key: RESPONSES_API_KEY / OPENAI_API_KEY / ASXS_API_KEY / ~/.codex/auth.json
  RESPONSES_BASE_URL / OPENAI_BASE_URL / ASXS_BASE_URL
  RESPONSES_MODEL
  RESPONSES_REASONING_EFFORT
  CODEX_HOME`);
}

function parseArgs(argv) {
  const options = {
    prompt: "",
    referenceImagePaths: [],
    size: DEFAULT_SIZE,
    quality: DEFAULT_QUALITY,
    format: DEFAULT_FORMAT,
    background: DEFAULT_BACKGROUND,
    output: "",
    baseUrl: "",
    model: "",
    reasoningEffort: "",
    codexHome: "",
    help: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (current === "--help" || current === "-h") {
      options.help = true;
      continue;
    }

    if (current === "--prompt" && next) {
      options.prompt = next;
      index += 1;
      continue;
    }

    if (current === "--reference-image" && next) {
      options.referenceImagePaths.push(next);
      index += 1;
      continue;
    }

    if (current === "--size" && next) {
      options.size = next;
      index += 1;
      continue;
    }

    if (current === "--quality" && next) {
      options.quality = next;
      index += 1;
      continue;
    }

    if (current === "--format" && next) {
      options.format = normalizeFormat(next);
      index += 1;
      continue;
    }

    if (current === "--background" && next) {
      options.background = next;
      index += 1;
      continue;
    }

    if (current === "--output" && next) {
      options.output = next;
      index += 1;
      continue;
    }

    if (current === "--base-url" && next) {
      options.baseUrl = next;
      index += 1;
      continue;
    }

    if (current === "--model" && next) {
      options.model = next;
      index += 1;
      continue;
    }

    if (current === "--reasoning-effort" && next) {
      options.reasoningEffort = next;
      index += 1;
      continue;
    }

    if (current === "--codex-home" && next) {
      options.codexHome = next;
      index += 1;
      continue;
    }

    if (!current.startsWith("--") && !options.prompt) {
      options.prompt = current;
    }
  }

  return options;
}

function normalizeFormat(format) {
  const normalized = format.trim().toLowerCase();
  return normalized === "jpg" ? "jpeg" : normalized;
}

function buildOutputPath(outputPath, format) {
  if (outputPath) {
    return resolve(outputPath);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return resolve("output", `generated-${timestamp}.${format}`);
}

function inferMimeType(filePath) {
  const extension = extname(filePath).toLowerCase();

  switch (extension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".gif":
      return "image/gif";
    default:
      throw new Error(`不支持的参考图格式: ${filePath}`);
  }
}

function pickResolvedValue({
  cliValue,
  envCandidates = [],
  codexValue = "",
  fallbackValue = "",
  cliSource,
  codexSource,
  fallbackSource,
}) {
  if (cliValue) {
    return {
      value: cliValue,
      source: cliSource,
    };
  }

  for (const envCandidate of envCandidates) {
    if (envCandidate.value) {
      return {
        value: envCandidate.value,
        source: envCandidate.source,
      };
    }
  }

  if (codexValue) {
    return {
      value: codexValue,
      source: codexSource,
    };
  }

  return {
    value: fallbackValue,
    source: fallbackSource,
  };
}

async function resolveRuntimeSettings(options) {
  const codexRuntime = await readCodexRuntimeConfig({
    codexHome: options.codexHome,
  });
  const warnings = [];

  if (
    codexRuntime.config.providerWireApi &&
    codexRuntime.config.providerWireApi !== "responses" &&
    !options.baseUrl &&
    !process.env.RESPONSES_BASE_URL &&
    !process.env.OPENAI_BASE_URL &&
    !process.env.ASXS_BASE_URL
  ) {
    warnings.push(
      `Codex 当前 provider 的 wire_api = ${codexRuntime.config.providerWireApi}，这个 skill 仍会尝试复用它的 base_url 调用 /responses。`,
    );
  }

  const apiKey = pickResolvedValue({
    cliValue: "",
    envCandidates: [
      { value: process.env.RESPONSES_API_KEY || "", source: "RESPONSES_API_KEY" },
      { value: process.env.OPENAI_API_KEY || "", source: "OPENAI_API_KEY" },
      { value: process.env.ASXS_API_KEY || "", source: "ASXS_API_KEY" },
    ],
    codexValue: codexRuntime.auth.openAiApiKey,
    fallbackValue: "",
    cliSource: "",
    codexSource: `Codex auth (${codexRuntime.auth.authPath})`,
    fallbackSource: "",
  });

  const baseUrl = pickResolvedValue({
    cliValue: options.baseUrl,
    envCandidates: [
      { value: process.env.RESPONSES_BASE_URL || "", source: "RESPONSES_BASE_URL" },
      { value: process.env.OPENAI_BASE_URL || "", source: "OPENAI_BASE_URL" },
      { value: process.env.ASXS_BASE_URL || "", source: "ASXS_BASE_URL" },
    ],
    codexValue: codexRuntime.config.providerBaseUrl,
    fallbackValue: DEFAULT_BASE_URL,
    cliSource: "--base-url",
    codexSource: `Codex config (${codexRuntime.config.configPath})`,
    fallbackSource: "hardcoded default",
  });

  const model = pickResolvedValue({
    cliValue: options.model,
    envCandidates: [{ value: process.env.RESPONSES_MODEL || "", source: "RESPONSES_MODEL" }],
    codexValue: codexRuntime.config.model,
    fallbackValue: DEFAULT_MODEL,
    cliSource: "--model",
    codexSource: `Codex config (${codexRuntime.config.configPath})`,
    fallbackSource: "hardcoded default",
  });

  const reasoningEffort = pickResolvedValue({
    cliValue: options.reasoningEffort,
    envCandidates: [
      {
        value: process.env.RESPONSES_REASONING_EFFORT || "",
        source: "RESPONSES_REASONING_EFFORT",
      },
    ],
    codexValue: codexRuntime.config.reasoningEffort,
    fallbackValue: "",
    cliSource: "--reasoning-effort",
    codexSource: `Codex config (${codexRuntime.config.configPath})`,
    fallbackSource: "not set",
  });

  if (!apiKey.value) {
    throw new Error(
      "缺少可用的 API Key。请设置 RESPONSES_API_KEY / OPENAI_API_KEY / ASXS_API_KEY，或确认 Codex 已在 ~/.codex/auth.json 中配置 OPENAI_API_KEY。",
    );
  }

  return {
    apiKey,
    baseUrl,
    model,
    reasoningEffort,
    warnings,
  };
}

async function loadReferenceImages(referenceImagePaths) {
  if (referenceImagePaths.length > MAX_REFERENCE_IMAGES) {
    throw new Error(`参考图最多支持 ${MAX_REFERENCE_IMAGES} 张。`);
  }

  return Promise.all(
    referenceImagePaths.map(async (referenceImagePath) => {
      const absolutePath = resolve(referenceImagePath);
      const buffer = await readFile(absolutePath);
      return {
        absolutePath,
        filename: basename(absolutePath),
        mimeType: inferMimeType(absolutePath),
        base64: buffer.toString("base64"),
      };
    }),
  );
}

function validateOptions(options) {
  if (!options.prompt.trim()) {
    throw new Error("缺少提示词，请通过 --prompt 传入。");
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (options.help) {
    printHelp();
    return;
  }

  validateOptions(options);

  const runtimeSettings = await resolveRuntimeSettings(options);
  const referenceImages = await loadReferenceImages(options.referenceImagePaths);

  for (const warning of runtimeSettings.warnings) {
    console.warn(`提示: ${warning}`);
  }

  console.log(`请求地址: ${runtimeSettings.baseUrl.value.replace(/\\/g, "/")}/responses`);
  console.log(`外层模型: ${runtimeSettings.model.value}`);
  console.log(`图片工具模型: ${DEFAULT_IMAGE_MODEL}`);
  console.log(`提示词: ${options.prompt}`);
  console.log(`参考图数量: ${referenceImages.length}`);
  console.log(`Base URL 来源: ${runtimeSettings.baseUrl.source}`);
  console.log(`模型来源: ${runtimeSettings.model.source}`);
  console.log(`API Key 来源: ${runtimeSettings.apiKey.source}`);
  console.log(`推理强度来源: ${runtimeSettings.reasoningEffort.source}`);

  if (referenceImages.length > 0) {
    for (const image of referenceImages) {
      console.log(`参考图: ${image.absolutePath}`);
    }
  }

  const result = await requestImageGeneration({
    baseUrl: runtimeSettings.baseUrl.value,
    apiKey: runtimeSettings.apiKey.value,
    prompt: options.prompt,
    referenceImages,
    size: options.size,
    quality: options.quality,
    format: options.format,
    background: options.background,
    responsesModel: runtimeSettings.model.value,
    reasoningEffort: runtimeSettings.reasoningEffort.value || undefined,
    async onEvent(event) {
      if (event.type === "status") {
        console.log(`${event.stage}: ${event.message}`);
      }

      if (event.type === "partial_image") {
        console.log("收到一张中间预览图");
      }

      if (event.type === "complete") {
        console.log("流式响应结束");
      }
    },
  });

  if (!result.finalImageBase64) {
    throw new Error("上游响应结束，但没有拿到最终图片。");
  }

  const outputPath = buildOutputPath(options.output, options.format);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, Buffer.from(normalizeBase64(result.finalImageBase64), "base64"));

  console.log(`已保存图片: ${outputPath}`);
  console.log(`文件名: ${basename(outputPath)}`);
  console.log(`格式: ${options.format}`);
  console.log(`中间预览图数量: ${result.partialImages.length}`);
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
