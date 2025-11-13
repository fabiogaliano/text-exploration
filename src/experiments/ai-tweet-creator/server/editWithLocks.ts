import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enforceTweetLength } from "./utils";
import { buildEditWithLocks } from "../prompts";
import { generateText } from "~/lib/ai/run";

export const editWithLocks = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      previous: z.string().min(1),
      locked: z.array(z.string()),
      idea: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const prompt = buildEditWithLocks({ previous: data.previous, locked: data.locked, idea: data.idea });
    const { text } = await generateText({ prompt });
    return { tweet: enforceTweetLength(text) };
  });
