import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateStructuredData } from "~/lib/ai/run";
import { buildIdealSummaryPrompt } from "../prompts";
import { IdealSummarySchema } from "../schemas";

export const generateIdealSummary = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      chapterText: z.string().min(1, "Chapter text is required"),
      userAttempts: z.array(z.string()),
    })
  )
  .handler(async ({ data }) => {
    const prompt = buildIdealSummaryPrompt({
      chapterText: data.chapterText,
      userAttempts: data.userAttempts,
    });

    const { object } = await generateStructuredData({
      prompt,
      schema: IdealSummarySchema,
    });

    return object;
  });
