import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "~/lib/ai/run";
import { google } from "~/lib/ai/google";
import { buildIdealSummaryPromptExtended } from "../prompts";

export const generateExtendedSummaryV2 = createServerFn({ method: "POST" })
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

    // Use text generation with explicit instruction to complete
    const enhancedPrompt = `${prompt}

CRITICAL: Generate the COMPLETE ideal summary now. Do not stop until fully complete. Include ALL key concepts and examples. DO NOT TRUNCATE.`;

    // Use text generation instead of structured data for more control
    const { text } = await generateText({
      prompt: enhancedPrompt,
      model: google("gemini-2.5-flash"), // Explicitly use the model
    });

    // Debug logging
    console.log("=== GenerateExtendedSummaryV2 Debug ===");
    console.log("Version: extended V2 (text generation)");
    console.log("First 500 chars:", text.substring(0, 500));
    console.log("Total length:", text.length);
    console.log("Last 200 chars:", text.substring(text.length - 200));
    console.log("=====================================");

    return { idealSummary: text };
  });