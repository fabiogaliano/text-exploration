import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText } from "~/lib/ai/run";
import { buildConversationPrompt } from "../prompts";

export const answerQuestion = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      chapterText: z.string().min(1, "Chapter text is required"),
      userNotes: z.string().min(1, "Notes are required"),
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
    const prompt = buildConversationPrompt({
      chapterText: data.chapterText,
      userNotes: data.userNotes,
      conversationHistory: data.conversationHistory,
      question: data.question,
    });

    const { text } = await generateText({ prompt });

    return { answer: text };
  });
