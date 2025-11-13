import { z } from "zod";

/**
 * Schema for initial analysis of user's summary
 */
export const AnalysisSchema = z.object({
  score: z.number().min(0).max(100).describe("Overall comprehension score (0-100)"),
  feedback: z.string().describe("Qualitative feedback on the summary"),
  strengths: z.array(z.string()).describe("What the user did well"),
  improvements: z.array(z.string()).describe("Areas for improvement"),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

/**
 * Schema for re-analysis with context of previous attempts
 */
export const ReanalysisSchema = AnalysisSchema.extend({
  progressNote: z.string().describe("Note on progress since last attempt"),
});

export type Reanalysis = z.infer<typeof ReanalysisSchema>;

/**
 * Schema for ideal summary generation
 */
export const IdealSummarySchema = z.object({
  idealSummary: z.string().describe("Example of a well-written summary"),
});

export type IdealSummary = z.infer<typeof IdealSummarySchema>;

/**
 * Schema for conversational Q&A responses
 */
export const ConversationSchema = z.object({
  answer: z.string().describe("AI tutor's answer to the question"),
});

export type Conversation = z.infer<typeof ConversationSchema>;

/**
 * Schema for a single feedback attempt
 */
export const AttemptSchema = z.object({
  notes: z.string(),
  score: z.number(),
  feedback: z.string(),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  timestamp: z.number(),
});

export type Attempt = z.infer<typeof AttemptSchema>;
