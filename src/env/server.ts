import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  server: {
    VITE_BASE_URL: z.url().default("http://localhost:3000"),

    // Convex Auth OAuth providers
    AUTH_GITHUB_ID: z.string().optional(),
    AUTH_GITHUB_SECRET: z.string().optional(),
    AUTH_GOOGLE_ID: z.string().optional(),
    AUTH_GOOGLE_SECRET: z.string().optional(),
    GOOGLE_GENERATIVE_AI_API_KEY: z.string().optional(),
  },
  runtimeEnv: process.env,
});
