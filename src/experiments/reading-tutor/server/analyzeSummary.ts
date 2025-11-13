import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateStructuredData } from "~/lib/ai/run";
import { buildAnalysisPrompt } from "../prompts";
import { AnalysisSchema } from "../schemas";

export const analyzeSummary = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      chapterText: z.string().min(1, "Chapter text is required"),
      userNotes: z.string().min(1, "Notes are required"),
    })
  )
  .handler(async ({ data }) => {
    const prompt = buildAnalysisPrompt({
      chapterText: data.chapterText,
      userNotes: data.userNotes,
    });

    const { object } = await generateStructuredData({
      prompt,
      schema: AnalysisSchema,
    });

    // Debug logging
    console.log("=== AnalyzeSummary Debug ===");
    console.log("Feedback (first 500 chars):", object.feedback.substring(0, 500));
    console.log("Strengths array:", JSON.stringify(object.strengths, null, 2));
    console.log("Improvements array:", JSON.stringify(object.improvements, null, 2));
    console.log("=========================");

    return object;
  });
