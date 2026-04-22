export const DEFAULT_IMAGE_MODEL = "gpt-image-2";

export function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/+$/, "");
}

export function normalizeBase64(value) {
  return value.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "").trim();
}

export function buildResponsesInput({ prompt, referenceImages = [] }) {
  const images = Array.isArray(referenceImages)
    ? referenceImages.filter(Boolean)
    : referenceImages
      ? [referenceImages]
      : [];

  if (images.length === 0) {
    return prompt;
  }

  return [
    {
      role: "user",
      content: [
        {
          type: "input_text",
          text: prompt,
        },
        ...images.map((referenceImage) => ({
          type: "input_image",
          image_url: `data:${referenceImage.mimeType};base64,${referenceImage.base64}`,
        })),
      ],
    },
  ];
}

export function createResponsesRequestBody({
  prompt,
  referenceImages,
  size,
  quality,
  format,
  background,
  responsesModel,
  reasoningEffort,
}) {
  const requestBody = {
    model: responsesModel,
    input: buildResponsesInput({ prompt, referenceImages }),
    stream: true,
    tool_choice: {
      type: "image_generation",
    },
    tools: [
      {
        type: "image_generation",
        model: DEFAULT_IMAGE_MODEL,
        size,
        quality,
        output_format: format,
        background,
      },
    ],
  };

  if (reasoningEffort) {
    requestBody.reasoning = {
      effort: reasoningEffort,
    };
  }

  return requestBody;
}

export function parseSseChunk(chunk) {
  const lines = chunk
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter(Boolean);

  let eventName = "";
  const dataLines = [];

  for (const line of lines) {
    if (line.startsWith(":")) {
      continue;
    }

    if (line.startsWith("event:")) {
      eventName = line.slice("event:".length).trim();
      continue;
    }

    if (line.startsWith("data:")) {
      dataLines.push(line.slice("data:".length).trim());
    }
  }

  return {
    eventName,
    data: dataLines.join("\n"),
  };
}

export function extractImageBase64(eventName, payload) {
  if (
    eventName === "response.output_item.done" &&
    payload?.item?.type === "image_generation_call" &&
    typeof payload.item.result === "string" &&
    payload.item.result.length > 0
  ) {
    return payload.item.result;
  }

  if (
    payload?.type === "image_generation_call" &&
    typeof payload.result === "string" &&
    payload.result.length > 0
  ) {
    return payload.result;
  }

  if (eventName === "response.completed" && Array.isArray(payload?.response?.output)) {
    const imageItem = payload.response.output.find(
      (item) => item?.type === "image_generation_call" && typeof item.result === "string",
    );

    if (imageItem?.result) {
      return imageItem.result;
    }
  }

  return null;
}

function makeDataUrl(base64, mimeType) {
  return `data:${mimeType};base64,${normalizeBase64(base64)}`;
}

async function emitEvent(onEvent, event) {
  if (typeof onEvent === "function") {
    await onEvent(event);
  }
}

export async function consumeResponsesSse(stream, { onEvent } = {}) {
  const reader = stream.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let responseCompleted = false;
  let finalImageBase64 = "";
  const partialImages = [];

  while (true) {
    let readResult;
    try {
      readResult = await reader.read();
    } catch (error) {
      const canUseBufferedResult =
        (finalImageBase64 || responseCompleted) &&
        error instanceof Error &&
        /terminated|socket|aborted/i.test(error.message);

      if (canUseBufferedResult) {
        return {
          finalImageBase64,
          partialImages,
          responseCompleted,
        };
      }

      throw error;
    }

    const { done, value } = readResult;
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split(/\r?\n\r?\n/);
    buffer = chunks.pop() ?? "";

    for (const chunk of chunks) {
      const { eventName, data } = parseSseChunk(chunk);
      if (!data) {
        continue;
      }

      if (data === "[DONE]") {
        return {
          finalImageBase64,
          partialImages,
          responseCompleted,
        };
      }

      const payload = JSON.parse(data);
      const resolvedEventName = eventName || payload?.type || "unknown";

      if (
        resolvedEventName === "response.image_generation_call.partial_image" &&
        typeof payload.partial_image_b64 === "string"
      ) {
        partialImages.push(payload.partial_image_b64);
        await emitEvent(onEvent, {
          type: "partial_image",
          base64: payload.partial_image_b64,
          dataUrl: makeDataUrl(payload.partial_image_b64, "image/png"),
        });
      }

      const maybeFinal = extractImageBase64(resolvedEventName, payload);
      if (maybeFinal && maybeFinal !== finalImageBase64) {
        finalImageBase64 = maybeFinal;
        await emitEvent(onEvent, {
          type: "final_image",
          base64: maybeFinal,
        });
      }

      if (resolvedEventName === "response.completed") {
        responseCompleted = true;
        await emitEvent(onEvent, {
          type: "complete",
        });
      }
    }
  }

  return {
    finalImageBase64,
    partialImages,
    responseCompleted,
  };
}

export async function requestImageGeneration({
  baseUrl,
  apiKey,
  prompt,
  referenceImages,
  size,
  quality,
  format,
  background,
  responsesModel,
  reasoningEffort,
  fetchImpl = globalThis.fetch,
  onEvent,
}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("当前 Node 环境不支持 fetch，请使用 Node.js 20 或更新版本。");
  }

  await emitEvent(onEvent, {
    type: "status",
    stage: "connecting",
    message: "正在连接上游服务",
  });

  const response = await fetchImpl(`${normalizeBaseUrl(baseUrl)}/responses`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify(
      createResponsesRequestBody({
        prompt,
        referenceImages,
        size,
        quality,
        format,
        background,
        responsesModel,
        reasoningEffort,
      }),
    ),
  });

  if (!response.ok) {
    throw new Error(`接口请求失败: HTTP ${response.status}\n${await response.text()}`);
  }

  if (!response.body) {
    throw new Error("接口没有返回可读取的流。");
  }

  await emitEvent(onEvent, {
    type: "status",
    stage: "generating",
    message: "正在生成图片",
  });

  const result = await consumeResponsesSse(response.body, {
    onEvent,
  });

  return {
    ...result,
    format,
  };
}
