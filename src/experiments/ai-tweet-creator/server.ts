import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "ai";
import { google } from "~/lib/ai/google";

export const generateTweet = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      idea: z.string().min(1),
    }),
  )
  .handler(async ({ data }) => {
    const { text } = await generateText({
      model: google("gemini-2.5-flash"),
      prompt:
        "Write a concise, engaging tweet under 280 characters. No emojis. No hashtags unless essential. Topic: " +
        data.idea,
    });
    const result = text.length > 280 ? text.slice(0, 280) : text;
    return { tweet: result };
  });
