import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateStructuredData } from "~/lib/ai/run";
import { buildReanalysisPrompt } from "../prompts";
import { ReanalysisSchema, AttemptSchema } from "../schemas";

export const reanalyze = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      chapterText: z.string().min(1, "Chapter text is required"),
      userNotes: z.string().min(1, "Notes are required"),
      previousAttempts: z.array(
        AttemptSchema.pick({ notes: true, score: true, feedback: true })
      ),
    })
  )
  .handler(async ({ data }) => {
    const prompt = buildReanalysisPrompt({
      chapterText: data.chapterText,
      userNotes: data.userNotes,
      previousAttempts: data.previousAttempts,
    });

    const { object } = await generateStructuredData({
      prompt,
      schema: ReanalysisSchema,
    });

    return object;
  });
