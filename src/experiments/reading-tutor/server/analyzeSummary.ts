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

    return object;
  });
