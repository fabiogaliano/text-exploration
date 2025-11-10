import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_BASE_URL: z.url().default("http://localhost:3000"),
    VITE_CONVEX_URL: z.string().url().default("http://127.0.0.1:3210"),
  },
  runtimeEnv: import.meta.env,
});
