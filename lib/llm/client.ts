// ============================================================
// lib/llm/client.ts — Thin OpenAI-compatible chat-completions
// client built on native fetch (no SDK). Reads configuration
// from environment variables. Raises typed errors so route
// handlers can degrade gracefully.
// ============================================================

import { SYSTEM_PROMPT } from "./prompt";

/** Base URL for the OpenAI-compatible API (e.g. Ark, OpenAI, DeepSeek). */
const DEFAULT_BASE_URL = "https://api.openai.com/v1";
const DEFAULT_TIMEOUT_MS = 8000;

// ---------- Typed errors ----------

export class LLMTimeoutError extends Error {
  constructor(message = "LLM request timed out") {
    super(message);
    this.name = "LLMTimeoutError";
  }
}

export class LLMAPIError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "LLMAPIError";
    this.status = status;
  }
}

export class LLMParseError extends Error {
  constructor(message = "LLM returned an unparseable response") {
    super(message);
    this.name = "LLMParseError";
  }
}

// ---------- Config ----------

interface LLMConfig {
  apiKey: string;
  model: string;
  baseUrl: string;
  timeoutMs: number;
}

function loadConfig(): LLMConfig {
  const apiKey = process.env.LLM_API_KEY ?? "";
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";
  const baseUrl = (process.env.LLM_API_BASE_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  const timeoutRaw = Number(process.env.LLM_TIMEOUT_MS ?? DEFAULT_TIMEOUT_MS);
  const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : DEFAULT_TIMEOUT_MS;

  if (!apiKey) {
    throw new LLMAPIError("LLM_API_KEY is not configured on the server");
  }
  return { apiKey, model, baseUrl, timeoutMs };
}

// ---------- Response shape (minimal) ----------

interface ChatCompletionResponse {
  choices?: Array<{
    message?: { content?: string | null };
  }>;
}

/**
 * Call the LLM with the given user text and return the raw
 * assistant message content. Throws LLMTimeoutError / LLMAPIError
 * / LLMParseError on failure.
 */
export async function callLLM(userText: string): Promise<string> {
  const config = loadConfig();
  const endpoint = `${config.baseUrl}/chat/completions`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userText },
        ],
        temperature: 0.3,
        response_format: { type: "json_object" },
        thinking: { type: "disabled" },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new LLMAPIError(
        `LLM API returned ${res.status}: ${detail.slice(0, 200)}`,
        res.status,
      );
    }

    const data = (await res.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== "string" || content.length === 0) {
      throw new LLMParseError("LLM response had no message content");
    }
    return content;
  } catch (err) {
    if (err instanceof LLMTimeoutError || err instanceof LLMAPIError || err instanceof LLMParseError) {
      throw err;
    }
    if (err instanceof Error && err.name === "AbortError") {
      throw new LLMTimeoutError();
    }
    throw new LLMAPIError(err instanceof Error ? err.message : "Unknown LLM failure");
  } finally {
    clearTimeout(timer);
  }
}
