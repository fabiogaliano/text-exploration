import { createServerFn } from "@tanstack/react-start";
import type { CoreMessage } from "ai";
import { z } from "zod";
import { generateStructuredData } from "~/lib/ai/run";
import { buildAnalysisPrompt } from "../prompts";
import { AnalysisSchema, toMultimodalContent, UserNotesSchema } from "../schemas";

/**
 * Helper to build multimodal messages from user notes
 */
function buildMultimodalMessages(params: {
  systemPrompt: string;
  userNotes: z.infer<typeof UserNotesSchema>;
}): CoreMessage[] {
  const content = toMultimodalContent(params.userNotes);

  const userMessageContent: Array<{type: "text", text: string} | {type: "image", image: string}> = [];

  // Add text content
  if (content.text) {
    userMessageContent.push({
      type: "text",
      text: content.text,
    });
  }

  // Add images if present
  for (const image of content.images) {
    userMessageContent.push({
      type: "image",
      image: image.data,
    });
  }

  return [
    {
      role: "system",
      content: params.systemPrompt,
    },
    {
      role: "user",
      content: userMessageContent as any, // Type cast needed due to AI SDK type complexity
    },
  ];
}

export const analyzeSummary = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      chapterText: z.string().min(1, "Chapter text is required"),
      userNotes: UserNotesSchema,
    })
  )
  .handler(async ({ data }) => {
    const content = toMultimodalContent(data.userNotes);

    // If no images, use simple prompt for backward compatibility
    if (content.images.length === 0) {
      const prompt = buildAnalysisPrompt({
        chapterText: data.chapterText,
        userNotes: content.text,
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
    }

    // If images present, use multimodal messages
    const systemPrompt = buildAnalysisPrompt({
      chapterText: data.chapterText,
      userNotes: content.text,
    });

    const messages = buildMultimodalMessages({
      systemPrompt,
      userNotes: data.userNotes,
    });

    const { object } = await generateStructuredData({
      messages,
      schema: AnalysisSchema,
    });

    // Debug logging
    console.log("=== AnalyzeSummary Debug (with images) ===");
    console.log("Image count:", content.images.length);
    console.log("Feedback (first 500 chars):", object.feedback.substring(0, 500));
    console.log("Strengths array:", JSON.stringify(object.strengths, null, 2));
    console.log("Improvements array:", JSON.stringify(object.improvements, null, 2));
    console.log("=========================");

    return object;
  });
