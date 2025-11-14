import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateStructuredData } from "~/lib/ai/run";
import { buildIdealSummaryPromptExtended } from "../prompts";
import { IdealSummarySchema } from "../schemas";

export const generateExtendedSummary = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      chapterText: z.string().min(1, "Chapter text is required"),
      userAttempts: z.array(z.string()),
    })
  )
  .handler(async ({ data }) => {
    const prompt = buildIdealSummaryPromptExtended({
      chapterText: data.chapterText,
      userAttempts: data.userAttempts,
    });

    const { object } = await generateStructuredData({
      prompt,
      schema: IdealSummarySchema,
      maxTokens: 8192, // Higher limit for extended summaries
    });

    // Debug logging
    console.log("=== GenerateExtendedSummary Debug ===");
    console.log("Version: extended");
    console.log("First 500 chars:", object.idealSummary.substring(0, 500));
    console.log("Total length:", object.idealSummary.length);
    console.log("=====================================");

    return object;
  });