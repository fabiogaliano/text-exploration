import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateStructuredData } from "~/lib/ai/run";
import { buildIdealSummaryPromptConcise } from "../prompts";
import { IdealSummarySchema } from "../schemas";

export const generateIdealSummary = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      chapterText: z.string().min(1, "Chapter text is required"),
      userAttempts: z.array(z.string()),
      version: z.enum(["concise", "extended"]).default("concise"),
    })
  )
  .handler(async ({ data }) => {
    // For now, always use concise version from this function
    // Extended version will be handled by separate server function
    const prompt = buildIdealSummaryPromptConcise({
      chapterText: data.chapterText,
      userAttempts: data.userAttempts,
    });

    const { object } = await generateStructuredData({
      prompt,
      schema: IdealSummarySchema,
      maxTokens: 4096, // Ensure we have enough tokens for complete summaries
    });

    // Debug logging
    console.log("=== GenerateIdealSummary (Concise) Debug ===");
    console.log("Version: concise");
    console.log("First 500 chars:", object.idealSummary.substring(0, 500));
    console.log("Total length:", object.idealSummary.length);
    console.log("=================================");

    return object;
  });
