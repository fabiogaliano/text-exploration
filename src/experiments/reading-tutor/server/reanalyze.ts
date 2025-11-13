import { createServerFn } from "@tanstack/react-start";
import type { CoreMessage } from "ai";
import { z } from "zod";
import { generateStructuredData } from "~/lib/ai/run";
import { buildReanalysisPrompt } from "../prompts";
import { ReanalysisSchema, AttemptSchema, toMultimodalContent, UserNotesSchema } from "../schemas";

export const reanalyze = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      chapterText: z.string().min(1, "Chapter text is required"),
      userNotes: UserNotesSchema,
      previousAttempts: z.array(
        AttemptSchema.pick({ notes: true, score: true, feedback: true })
      ),
    })
  )
  .handler(async ({ data }) => {
    const content = toMultimodalContent(data.userNotes);

    // Convert previous attempts to text-only (for prompt building)
    const previousAttemptsText = data.previousAttempts.map((attempt) => ({
      notes: typeof attempt.notes === "string" ? attempt.notes : attempt.notes.text,
      score: attempt.score,
      feedback: attempt.feedback,
    }));

    // If no images in current notes, use simple prompt
    if (content.images.length === 0) {
      const prompt = buildReanalysisPrompt({
        chapterText: data.chapterText,
        userNotes: content.text,
        previousAttempts: previousAttemptsText,
      });

      const { object } = await generateStructuredData({
        prompt,
        schema: ReanalysisSchema,
      });

      return object;
    }

    // If images present, build multimodal messages
    const systemPrompt = buildReanalysisPrompt({
      chapterText: data.chapterText,
      userNotes: content.text,
      previousAttempts: previousAttemptsText,
    });

    const userMessageContent: Array<{type: "text", text: string} | {type: "image", image: string}> = [
      {
        type: "text",
        text: content.text,
      },
    ];

    // Add images
    for (const image of content.images) {
      userMessageContent.push({
        type: "image",
        image: image.data,
      });
    }

    const messages: CoreMessage[] = [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: userMessageContent as any, // Type cast needed due to AI SDK type complexity
      },
    ];

    const { object } = await generateStructuredData({
      messages,
      schema: ReanalysisSchema,
    });

    return object;
  });
