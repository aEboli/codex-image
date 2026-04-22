import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function readUtf8IfExists(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") {
      return null;
    }

    throw error;
  }
}

function normalizeToml(text) {
  return text.replace(/\r\n/g, "\n");
}

function extractTomlString(text, key) {
  const pattern = new RegExp(`^${escapeRegExp(key)}\\s*=\\s*"([^"]*)"\\s*$`, "m");
  return text.match(pattern)?.[1] ?? "";
}

function extractTomlBoolean(text, key) {
  const pattern = new RegExp(`^${escapeRegExp(key)}\\s*=\\s*(true|false)\\s*$`, "m");
  const raw = text.match(pattern)?.[1];

  if (!raw) {
    return null;
  }

  return raw === "true";
}

function extractTomlSection(text, sectionName) {
  const normalized = normalizeToml(text);
  const pattern = new RegExp(
    `^\\[${escapeRegExp(sectionName)}\\]\\s*$\\n([\\s\\S]*?)(?=^\\[|\\Z)`,
    "m",
  );
  return normalized.match(pattern)?.[1] ?? "";
}

function getDefaultCodexHome() {
  return process.env.CODEX_HOME || join(homedir(), ".codex");
}

async function readCodexTomlConfig(codexHome) {
  const configPath = join(codexHome, "config.toml");
  const raw = await readUtf8IfExists(configPath);

  if (!raw) {
    return {
      configPath,
      providerName: "",
      model: "",
      reasoningEffort: "",
      providerBaseUrl: "",
      providerWireApi: "",
      providerRequiresOpenaiAuth: null,
    };
  }

  const providerName = extractTomlString(raw, "model_provider");
  const model = extractTomlString(raw, "model");
  const reasoningEffort = extractTomlString(raw, "model_reasoning_effort");
  const providerSection = providerName
    ? extractTomlSection(raw, `model_providers.${providerName}`)
    : "";

  return {
    configPath,
    providerName,
    model,
    reasoningEffort,
    providerBaseUrl: providerSection ? extractTomlString(providerSection, "base_url") : "",
    providerWireApi: providerSection ? extractTomlString(providerSection, "wire_api") : "",
    providerRequiresOpenaiAuth: providerSection
      ? extractTomlBoolean(providerSection, "requires_openai_auth")
      : null,
  };
}

async function readCodexAuthConfig(codexHome) {
  const authPath = join(codexHome, "auth.json");
  const raw = await readUtf8IfExists(authPath);

  if (!raw) {
    return {
      authPath,
      authMode: "",
      openAiApiKey: "",
    };
  }

  const parsed = JSON.parse(raw);

  return {
    authPath,
    authMode: typeof parsed.auth_mode === "string" ? parsed.auth_mode : "",
    openAiApiKey: typeof parsed.OPENAI_API_KEY === "string" ? parsed.OPENAI_API_KEY : "",
  };
}

export async function readCodexRuntimeConfig({ codexHome = "" } = {}) {
  const resolvedCodexHome = codexHome || getDefaultCodexHome();
  const [config, auth] = await Promise.all([
    readCodexTomlConfig(resolvedCodexHome),
    readCodexAuthConfig(resolvedCodexHome),
  ]);

  return {
    codexHome: resolvedCodexHome,
    config,
    auth,
  };
}
