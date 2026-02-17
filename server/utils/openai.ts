type ChatCompletionTextPart = {
  type: "text";
  text: string;
};

type ChatCompletionImagePart = {
  type: "image_url";
  image_url: {
    url: string;
  };
};

export type ChatCompletionContentPart = ChatCompletionTextPart | ChatCompletionImagePart;

export type ChatCompletionMessageParam = {
  role: "system" | "user" | "assistant";
  content: string | ChatCompletionContentPart[];
};

export class OpenAIUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenAIUnavailableError";
  }
}

type AIProvider = "openai" | "grok" | "groq";

type ProviderConfig = {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
};

const normalizeBaseUrl = (value: string) => value.replace(/\/+$/, "");

const buildChatCompletionsUrl = (baseUrl: string) => {
  const normalized = normalizeBaseUrl(baseUrl);
  if (normalized.endsWith("/v1")) {
    return `${normalized}/chat/completions`;
  }
  return `${normalized}/v1/chat/completions`;
};

const resolveProvider = (): AIProvider => {
  const provider = (process.env.AI_PROVIDER ?? "openai").trim().toLowerCase();
  if (provider === "grok" || provider === "xai") {
    return "grok";
  }
  if (provider === "groq") {
    return "groq";
  }
  return "openai";
};

const resolveProviderConfig = (): ProviderConfig => {
  const provider = resolveProvider();
  if (provider === "grok") {
    const apiKey = process.env.XAI_API_KEY ?? process.env.GROK_API_KEY ?? process.env.OPENAI_API_KEY ?? "";
    if (!apiKey) {
      throw new OpenAIUnavailableError("XAI_API_KEY is not configured");
    }
    const model = process.env.XAI_MODEL ?? process.env.GROK_MODEL ?? process.env.OPENAI_MODEL ?? "grok-3-mini-latest";
    const baseUrl = process.env.XAI_BASE_URL ?? process.env.OPENAI_BASE_URL ?? "https://api.x.ai/v1";
    return { provider, apiKey, model, baseUrl };
  }

  if (provider === "groq") {
    const apiKey = process.env.GROQ_API_KEY ?? "";
    if (!apiKey) {
      throw new OpenAIUnavailableError("GROQ_API_KEY is not configured");
    }
    const model = process.env.GROQ_MODEL ?? process.env.OPENAI_MODEL ?? "llama-3.3-70b-versatile";
    const baseUrl = process.env.GROQ_BASE_URL ?? process.env.OPENAI_BASE_URL ?? "https://api.groq.com/openai/v1";
    return { provider, apiKey, model, baseUrl };
  }

  const apiKey = process.env.OPENAI_API_KEY ?? "";
  if (!apiKey) {
    throw new OpenAIUnavailableError("OPENAI_API_KEY is not configured");
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini";
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  return { provider, apiKey, model, baseUrl };
};

const extractResponseText = (payload: unknown): string => {
  const data = payload as {
    choices?: Array<{ message?: { content?: string | Array<{ text?: string; content?: string }> | null } }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (typeof content === "string") {
    return content.trim();
  }
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (!part || typeof part !== "object") return "";
        if (typeof part.text === "string") return part.text;
        if (typeof part.content === "string") return part.content;
        return "";
      })
      .join("\n")
      .trim();
  }
  return "";
};

const parseJsonPayload = <T>(rawContent: string): T => {
  const withoutFence = rawContent.replace(/```json|```/gi, "").trim();
  let parsed: { content?: T } | T;
  try {
    parsed = JSON.parse(withoutFence) as { content?: T } | T;
  } catch {
    const start = withoutFence.indexOf("{");
    const end = withoutFence.lastIndexOf("}");
    if (start >= 0 && end > start) {
      const candidate = withoutFence.slice(start, end + 1);
      parsed = JSON.parse(candidate) as { content?: T } | T;
    } else {
      throw new Error("Response was not valid JSON");
    }
  }

  if (
    parsed &&
    typeof parsed === "object" &&
    "content" in parsed &&
    (parsed as { content?: unknown }).content !== undefined
  ) {
    return (parsed as { content: T }).content;
  }

  return parsed as T;
};

type OpenAIResponse<T> = {
  content: T;
};

type OpenAIRequestOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
};

export const callOpenAI = async <T = unknown>(
  messages: ChatCompletionMessageParam[],
  responseFormat?: "json_object" | "text",
  options?: OpenAIRequestOptions
): Promise<OpenAIResponse<T>> => {
  const provider = resolveProviderConfig();
  const requestUrl = buildChatCompletionsUrl(provider.baseUrl);

  const response = await fetch(requestUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify({
      model: options?.model ?? provider.model,
      messages,
      response_format:
        responseFormat === "json_object"
          ? { type: "json_object" }
          : undefined,
      temperature: typeof options?.temperature === "number" ? options.temperature : 0.7,
      max_tokens: typeof options?.maxTokens === "number" ? options.maxTokens : undefined,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`${provider.provider} request failed: ${response.status} ${text}`);
  }

  const data = (await response.json()) as unknown;
  const content = extractResponseText(data);
  if (!content) {
    throw new Error(`${provider.provider} returned an empty response`);
  }

  if (responseFormat === "json_object") {
    const parsed = parseJsonPayload<T>(content);
    return { content: parsed };
  }

  return { content: content as unknown as T };
};
