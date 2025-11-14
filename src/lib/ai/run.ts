import { generateObject, generateText as generateTextInternal, type CoreMessage } from "ai";
import { google } from "~/lib/ai/google";
import { z } from "zod";

export async function generateText({
  prompt,
  messages,
  model,
}: {
  prompt?: string;
  messages?: CoreMessage[];
  model?: ReturnType<typeof google>;
}) {
  const usedModel = model ?? google("gemini-2.5-flash");
  if (messages) {
    return generateTextInternal({ model: usedModel, messages });
  }
  if (!prompt) {
    throw new Error("Either prompt or messages must be provided");
  }
  return generateTextInternal({ model: usedModel, prompt });
}

export async function generateStructuredData<T extends z.ZodTypeAny>({
  prompt,
  messages,
  schema,
  model,
  maxTokens,
}: {
  prompt?: string;
  messages?: CoreMessage[];
  schema: T;
  model?: ReturnType<typeof google>;
  maxTokens?: number;
}) {
  const usedModel = model ?? google("gemini-2.5-flash");
  const options = {
    model: usedModel,
    schema,
    maxTokens: maxTokens ?? 8192, // Increase default to ensure complete responses
  };

  if (messages) {
    return generateObject({ ...options, messages });
  }
  if (!prompt) {
    throw new Error("Either prompt or messages must be provided");
  }
  return generateObject({ ...options, prompt });
}
