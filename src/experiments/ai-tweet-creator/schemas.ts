import { z } from "zod";

export const ThreadSchema = z.object({
  tweets: z
    .array(
      z.object({
        text: z.string().min(1).max(280),
      }),
    )
    .min(1),
});
