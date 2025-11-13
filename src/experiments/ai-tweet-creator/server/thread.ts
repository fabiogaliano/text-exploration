import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enforceTweetLength } from "./utils";
import { buildThreadPrompt } from "../prompts";
import { generateStructuredData } from "~/lib/ai/run";
import { ThreadSchema } from "../schemas";

export const createThread = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      idea: z.string().min(1),
      count: z.number().int().min(2).max(20).optional(),
      style: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const count = data.count ?? 5;
    const prompt = buildThreadPrompt({ idea: data.idea, count, style: data.style });

    const { object } = await generateStructuredData({ schema: ThreadSchema, prompt });

    const tweets = object.tweets.map((t) => ({ text: enforceTweetLength(t.text) }));
    return { tweets };
  });
