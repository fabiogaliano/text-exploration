import { generateObject, generateText as generateTextInternal } from "ai";
import { google } from "~/lib/ai/google";
import { z } from "zod";

export async function generateText({
  prompt,
  model,
}: {
  prompt: string;
  model?: ReturnType<typeof google>;
}) {
  const usedModel = model ?? google("gemini-2.5-flash");
  return generateTextInternal({ model: usedModel, prompt });
}

export async function generateStructuredData<T extends z.ZodTypeAny>({
  prompt,
  schema,
  model,
}: {
  prompt: string;
  schema: T;
  model?: ReturnType<typeof google>;
}) {
  const usedModel = model ?? google("gemini-2.5-flash");
  return generateObject({ model: usedModel, schema, prompt });
}
