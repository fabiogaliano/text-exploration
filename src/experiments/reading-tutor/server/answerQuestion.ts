import { createServerFn } from "@tanstack/react-start";
import type { CoreMessage } from "ai";
import { z } from "zod";
import { generateText } from "~/lib/ai/run";
import { buildConversationPrompt } from "../prompts";
import { toMultimodalContent, UserNotesSchema } from "../schemas";

export const answerQuestion = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      chapterText: z.string().min(1, "Chapter text is required"),
      userNotes: UserNotesSchema,
      conversationHistory: z.array(
        z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })
      ),
      question: z.string().min(1, "Question is required"),
    })
  )
  .handler(async ({ data }) => {
    const content = toMultimodalContent(data.userNotes);

    // If no images, use simple prompt
    if (content.images.length === 0) {
      const prompt = buildConversationPrompt({
        chapterText: data.chapterText,
        userNotes: content.text,
        conversationHistory: data.conversationHistory,
        question: data.question,
      });

      const { text } = await generateText({ prompt });

      return { answer: text };
    }

    // If images present, build multimodal messages
    const systemPrompt = buildConversationPrompt({
      chapterText: data.chapterText,
      userNotes: content.text,
      conversationHistory: data.conversationHistory,
      question: data.question,
    });

    const userMessageContent: Array<{type: "text", text: string} | {type: "image", image: string}> = [
      {
        type: "text",
        text: data.question,
      },
    ];

    // Add images from notes context
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
      ...data.conversationHistory.map((msg): CoreMessage => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user",
        content: userMessageContent as any, // Type cast needed due to AI SDK type complexity
      },
    ];

    const { text } = await generateText({ messages });

    return { answer: text };
  });
