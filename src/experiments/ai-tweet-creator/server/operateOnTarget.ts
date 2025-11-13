import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { enforceTweetLength } from "./utils";
import { buildTargetOperation } from "../prompts";
import { generateText } from "~/lib/ai/run";

export const operateOnTarget = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      previous: z.string().min(1),
      target: z.string().min(1),
      operation: z.enum(["rephrase", "condense"]),
      locked: z.array(z.string()).optional(),
      idea: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const prompt = buildTargetOperation({
      previous: data.previous,
      target: data.target,
      operation: data.operation,
      locked: data.locked,
      idea: data.idea,
    });
    const { text } = await generateText({ prompt });
    return { tweet: enforceTweetLength(text) };
  });
