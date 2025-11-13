import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enforceTweetLength } from "./utils";
import { buildInitialTweet } from "../prompts";
import { generateText } from "~/lib/ai/run";

export const createTweet = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      idea: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const prompt = buildInitialTweet({ idea: data.idea });
    const { text } = await generateText({ prompt });
    return { tweet: enforceTweetLength(text) };
  });
