/**
 * Prompt engineering functions for the reading tutor
 */

/**
 * Grading rubric for chapter summaries
 */
const GRADING_RUBRIC = `
## Grading Rubric (Total: 100 points)

1. **Key Concepts Coverage (40 points)**
   - Identifies all major concepts and ideas from the chapter
   - Includes important definitions and principles
   - Captures the main thesis or argument

2. **Understanding in Own Words (30 points)**
   - Demonstrates genuine comprehension, not just paraphrasing
   - Uses original examples or analogies
   - Shows ability to explain concepts independently

3. **Examples and Application (20 points)**
   - Includes relevant examples (from chapter or own)
   - Shows how concepts apply in practice
   - Demonstrates ability to connect ideas

4. **Clarity and Organization (10 points)**
   - Well-structured and easy to follow
   - Clear and concise writing
   - Logical flow of ideas
`;

/**
 * Base instructions for the AI tutor role
 */
const TUTOR_ROLE = `
You are a patient and insightful reading tutor. Your goal is to help the user improve their reading comprehension and note-taking skills through constructive feedback.

Be encouraging but honest. Point out specific areas for improvement with concrete examples. Ask probing questions that help the user think deeper about the material.
`;

interface BuildAnalysisPromptParams {
  chapterText: string;
  userNotes: string;
}

/**
 * Build prompt for initial analysis of user's summary
 */
export function buildAnalysisPrompt({
  chapterText,
  userNotes,
}: BuildAnalysisPromptParams): string {
  return [
    TUTOR_ROLE,
    "## Your Task",
    "Evaluate the user's chapter summary based on the grading rubric below.",
    "",
    GRADING_RUBRIC,
    "",
    "## Original Chapter",
    chapterText,
    "",
    "## User's Summary",
    userNotes,
    "",
    "## Instructions",
    "1. Calculate a score (0-100) based on the rubric",
    "2. Provide specific, actionable feedback",
    "3. List 2-3 strengths in the summary",
    "4. List 2-4 areas for improvement",
    "5. Be encouraging while being honest about gaps",
  ].join("\n");
}

interface PreviousAttempt {
  notes: string;
  score: number;
  feedback: string;
}

interface BuildReanalysisPromptParams {
  chapterText: string;
  userNotes: string;
  previousAttempts: PreviousAttempt[];
}

/**
 * Build prompt for re-analysis with context of previous attempts
 */
export function buildReanalysisPrompt({
  chapterText,
  userNotes,
  previousAttempts,
}: BuildReanalysisPromptParams): string {
  const previousAttemptsText = previousAttempts
    .map(
      (attempt, index) => `
### Attempt ${index + 1} (Score: ${attempt.score}/100)

**Notes:**
${attempt.notes}

**Previous Feedback:**
${attempt.feedback}
`
    )
    .join("\n");

  return [
    TUTOR_ROLE,
    "## Your Task",
    "Re-evaluate the user's improved chapter summary, considering their previous attempts and your earlier feedback.",
    "",
    GRADING_RUBRIC,
    "",
    "## Original Chapter",
    chapterText,
    "",
    "## Previous Attempts",
    previousAttemptsText,
    "",
    "## Current Summary (Latest Attempt)",
    userNotes,
    "",
    "## Instructions",
    "1. Calculate a new score (0-100) based on the rubric",
    "2. Note specific improvements from previous attempts",
    "3. Provide feedback on what's better and what still needs work",
    "4. List current strengths",
    "5. List remaining areas for improvement",
    "6. Add a progress note comparing this attempt to previous ones",
  ].join("\n");
}

interface BuildIdealSummaryPromptParams {
  chapterText: string;
  userAttempts: string[];
}

/**
 * Build prompt for generating an ideal summary example
 */
export function buildIdealSummaryPrompt({
  chapterText,
  userAttempts,
}: BuildIdealSummaryPromptParams): string {
  return [
    TUTOR_ROLE,
    "## Your Task",
    "Create an exemplary summary of the chapter that demonstrates best practices in comprehension and note-taking.",
    "",
    GRADING_RUBRIC,
    "",
    "## Original Chapter",
    chapterText,
    "",
    "## User's Attempts (for context)",
    ...userAttempts.map((notes, i) => `### Attempt ${i + 1}\n${notes}\n`),
    "",
    "## Instructions",
    "1. Write a model summary that scores 90+ on the rubric",
    "2. Include all key concepts with clear explanations",
    "3. Use original examples or analogies to demonstrate understanding",
    "4. Maintain clarity and logical organization",
    "5. Provide an explanation of why this summary is effective",
    "6. Reference specific techniques used (concept mapping, examples, etc.)",
  ].join("\n");
}

interface BuildConversationPromptParams {
  chapterText: string;
  userNotes: string;
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>;
  question: string;
}

/**
 * Build prompt for conversational Q&A mode
 */
export function buildConversationPrompt({
  chapterText,
  userNotes,
  conversationHistory,
  question,
}: BuildConversationPromptParams): string {
  const historyText =
    conversationHistory.length > 0
      ? conversationHistory
          .map((msg) => `**${msg.role === "user" ? "Student" : "Tutor"}:** ${msg.content}`)
          .join("\n\n")
      : "No previous conversation.";

  return [
    TUTOR_ROLE,
    "## Context",
    "The user is working on improving their chapter summary and has questions for you.",
    "",
    "## Original Chapter",
    chapterText,
    "",
    "## User's Current Summary",
    userNotes,
    "",
    "## Conversation History",
    historyText,
    "",
    "## Current Question",
    question,
    "",
    "## Instructions",
    "1. Answer the question thoughtfully and pedagogically",
    "2. Use Socratic questioning when appropriate to deepen understanding",
    "3. Reference specific parts of the chapter or their notes",
    "4. Encourage critical thinking rather than just providing answers",
    "5. Be conversational and supportive",
  ].join("\n");
}
