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
    "Evaluate the user's chapter summary based on the grading rubric below. Be specific and actionable in your feedback.",
    "",
    GRADING_RUBRIC,
    "",
    "## Original Chapter",
    chapterText,
    "",
    "## User's Summary",
    userNotes,
    "",
    "## Evaluation Guidelines",
    "### When Identifying Strengths:",
    "- Point to SPECIFIC elements the user included correctly",
    "- Acknowledge good understanding of concepts",
    "- Note effective use of examples or clear explanations",
    "",
    "### When Identifying Areas for Improvement:",
    "- Be SPECIFIC about what's missing or unclear",
    "- Focus on CONCEPTUAL gaps, not trivial details",
    "- Suggest concrete additions or clarifications needed",
    "- Prioritize improvements that would most enhance understanding",
    "",
    "### What Makes a Good Summary:",
    "- Captures the core theme and main concepts",
    "- Explains WHY concepts matter, not just what they are",
    "- Uses concrete examples to illustrate abstract ideas",
    "- Shows connections between concepts",
    "- Demonstrates understanding in own words",
    "",
    "### Avoid Suggesting Improvements For:",
    "- Historical trivia (names, dates) unless central",
    "- Minor details that don't affect core understanding",
    "- Style preferences if the content is clear",
    "",
    "## Instructions",
    "1. Calculate a score (0-100) based on the rubric",
    "2. Provide specific, actionable feedback with examples",
    "3. List 2-3 concrete strengths (reference specific parts of their summary)",
    "4. List 2-4 specific areas for improvement (explain what to add/clarify)",
    "5. Be encouraging while being honest about conceptual gaps",
    "6. Focus feedback on understanding, not memorization",
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
 * Build prompt for generating a CONCISE ideal summary example (Bullet Points version)
 * Focuses on core concepts with brief critical examples only
 */
export function buildIdealSummaryPromptConcise({
  chapterText,
  userAttempts,
}: BuildIdealSummaryPromptParams): string {
  return [
    TUTOR_ROLE,
    "## Your Task",
    "Create a BRIEF, CONCISE bullet-point summary capturing ONLY the essential concepts. Be extremely concise.",
    "",
    "## STRICT Format Requirements",
    "- Maximum 10-12 total bullet points (including sub-bullets)",
    "- Each bullet: ONE SHORT SENTENCE (max 15-20 words)",
    "- Use simple dash bullets (- )",
    "- 3-4 main concepts maximum",
    "- 1-2 sub-bullets per concept (only if essential)",
    "",
    "## Writing Style",
    "- BE CONCISE: Every word must be essential",
    "- NO verbose explanations or long sentences",
    "- Focus on WHAT and WHY, skip HOW unless critical",
    "- Use simple, clear language",
    "",
    "## Content Template",
    "```markdown",
    "- **Core Theme**: [One sentence, max 20 words]",
    "",
    "- **Key Concept 1**: [Brief definition, max 15 words]",
    "  - Why: [One key reason, max 10 words]",
    "  - Example: [Only if needed, max 10 words]",
    "",
    "- **Key Concept 2**: [Brief definition, max 15 words]",
    "  - Key insight: [One crucial point, max 10 words]",
    "",
    "- **Key Concept 3**: [Brief definition, max 15 words]",
    "  - Application: [One practical use, max 10 words]",
    "```",
    "",
    "## Examples of Good Conciseness",
    "GOOD: \"Morse code uses two states (dot/dash) to encode letters\"",
    "BAD: \"Morse code offers an efficient and adaptable solution by using a two-state system of short and long signals (dots and dashes)\"",
    "",
    "GOOD: \"Binary systems create many combinations from two elements\"",
    "BAD: \"The fundamental principle of using two distinct states or elements is powerful enough to encode vast amounts of information\"",
    "",
    "## What to EXCLUDE",
    "- Historical details (names, dates)",
    "- Step-by-step explanations",
    "- Multiple examples per concept",
    "- Elaborate descriptions",
    "- Redundant information",
    "",
    "## Original Chapter",
    chapterText,
    "",
    "## User's Attempts (for context)",
    ...userAttempts.map((notes, i) => `### Attempt ${i + 1}\n${notes}\n`),
    "",
    "## Final Reminders",
    "1. BREVITY is key - aim for minimal word count",
    "2. Complete thoughts but SHORT sentences",
    "3. Only the MOST essential information",
    "4. If it's not crucial, leave it out",
    "5. Think \"tweet-length\" bullets, not paragraphs",
  ].join("\n");
}

/**
 * Build prompt for generating an EXTENDED ideal summary example
 * Full detailed analysis with comprehensive examples and connections
 */
export function buildIdealSummaryPromptExtended({
  chapterText,
  userAttempts,
}: BuildIdealSummaryPromptParams): string {
  return [
    TUTOR_ROLE,
    "## Your Task",
    "Create a COMPLETE, COMPREHENSIVE chapter summary. You MUST finish the entire summary - do not stop partway through.",
    "",
    "## Format Requirements",
    "- Use markdown bullet points (- ) and bold headings (**Concept Name**)",
    "- Each bullet is one complete sentence or thought",
    "- Use 2-space indentation for sub-bullets",
    "- Add blank lines between concepts for readability",
    "",
    "## Structure (Complete ALL sections)",
    "1. **Chapter Core Theme**: 1-2 paragraph synthesis",
    "2. **Key Concepts**: Cover ALL major ideas (typically 3-6 concepts)",
    "3. For EACH concept include:",
    "   - Clear definition/explanation",
    "   - Why it matters",
    "   - How it works (when relevant)",
    "   - 2-3 concrete examples",
    "   - Connections to other concepts",
    "",
    "## Example Quality Guidelines",
    "**High-Value Examples**:",
    "- Mathematical demonstrations: '2^4 = 16 possible codes with 4 elements'",
    "- Practical analogies: 'Like a decision tree where each branch doubles possibilities'",
    "- Real applications: 'Modern computers use this binary principle in all operations'",
    "- Pattern illustrations: 'Each table has 2x the codes of the previous: 2, 4, 8, 16'",
    "",
    "**Low-Value Examples** (avoid unless central to understanding):",
    "- Historical trivia: Names, dates, biographical details",
    "- Redundant restatements: Saying the same thing differently",
    "- Peripheral details: Information not core to the concept",
    "",
    "## Example Structure",
    "```markdown",
    "**Chapter Core Theme**",
    "",
    "[1-2 paragraph explanation of the chapter's central message and how all concepts connect to it]",
    "",
    "**Key Concept 1: [Concept Name]**",
    "",
    "- **Definition**: [Clear explanation in own words]",
    "- **Why it matters**: [Significance]",
    "- **How it works**: [Mechanism if relevant]",
    "- **Example 1**: [Concrete example from text]",
    "- **Example 2**: [Own analogy or real-world case]",
    "- **Connects to**: [How it relates to other concepts]",
    "",
    "**Key Concept 2: [Concept Name]**",
    "",
    "- **Definition**: [Clear explanation]",
    "- **Core principle**: [Fundamental rule]",
    "- **Mathematical pattern**: [Formula if applicable]",
    "- **Demonstration**: [Step-by-step example]",
    "- **Application**: [Practical use]",
    "",
    "[Repeat for ALL remaining concepts - do not stop early]",
    "```",
    "",
    GRADING_RUBRIC,
    "",
    "## Original Chapter",
    chapterText,
    "",
    "## User's Attempts (for context - identify what they missed)",
    ...userAttempts.map((notes, i) => `### Attempt ${i + 1}\n${notes}\n`),
    "",
    "## Critical Requirements",
    "1. **FINISH THE ENTIRE SUMMARY** - Cover all concepts completely",
    "2. **NO STOPPING EARLY** - If you start a concept, finish it fully",
    "3. Focus on WHY and HOW, not just WHAT",
    "4. Use concrete examples that clarify abstract ideas",
    "5. Avoid historical trivia unless it's central to understanding",
    "6. Address what the user missed in their attempts",
    "7. Quality examples > quantity of examples",
  ].join("\n");
}

/**
 * Build prompt for generating an ideal summary example
 * @deprecated Use buildIdealSummaryPromptConcise or buildIdealSummaryPromptExtended instead
 */
export function buildIdealSummaryPrompt({
  chapterText,
  userAttempts,
}: BuildIdealSummaryPromptParams): string {
  // Default to concise version for backward compatibility
  return buildIdealSummaryPromptConcise({ chapterText, userAttempts });
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
