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
    "Create a CONCISE chapter summary that captures the essential concepts with brief examples only when critical for understanding.",
    "",
    "## Format Requirements",
    "- Use markdown bullet points with proper line breaks",
    "- Keep each bullet to ONE LINE (no paragraphs)",
    "- Maximum 3-5 main concepts",
    "- Include brief examples ONLY when absolutely necessary for understanding difficult concepts",
    "- Focus on WHAT and WHY, minimize HOW unless critical",
    "",
    "## Content Guidelines",
    "- **Core Theme**: One sentence synthesis of the chapter's main message",
    "- **Key Concepts**: Only the most important 3-5 ideas",
    "- **Examples**: Include ONLY when concept is abstract or counterintuitive",
    "- **Length**: Aim for 10-15 bullet points total (including nested)",
    "",
    "## Example Structure",
    "```markdown",
    "- Core Theme: [One sentence synthesis]",
    "",
    "  - Key Concept 1: [Brief definition]",
    "    - Why it matters: [One line significance]",
    "    - Critical example: [Only if absolutely needed]",
    "",
    "  - Key Concept 2: [Brief definition]",
    "    - Key insight: [Most important takeaway]",
    "```",
    "",
    "## Original Chapter",
    chapterText,
    "",
    "## User's Attempts (for context)",
    ...userAttempts.map((notes, i) => `### Attempt ${i + 1}\n${notes}\n`),
    "",
    "## Final Instructions",
    "1. Be CONCISE - every word should earn its place",
    "2. Focus on concepts that are central to understanding",
    "3. Include examples sparingly - only for difficult concepts",
    "4. Each bullet should be readable in one breath",
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
    "Create a COMPREHENSIVE chapter summary using a hierarchical bullet-point structure that demonstrates deep comprehension with detailed examples and connections.",
    "",
    "## Format Requirements",
    "- Use markdown bullet points (- or *) with proper line breaks",
    "- Each bullet should contain ONE atomic idea",
    "- **IMPORTANT**: Add a blank line between major sections/concepts",
    "- Indent nested bullets with 2 spaces per level",
    "- Parent nodes = main concepts, child nodes = details/examples/applications",
    "",
    "## Content Requirements",
    "- **Coverage**: Include ALL key concepts and main ideas from the chapter",
    "- **Understanding**: Express everything in YOUR OWN WORDS (demonstrate comprehension, not paraphrasing)",
    "- **Examples**: Add extensive concrete examples as child nodes under each concept",
    "  - Multiple examples from the chapter",
    "  - Your own original examples and analogies",
    "  - Edge cases and counterexamples where relevant",
    "- **Connections**: Show relationships between all concepts",
    "- **Applications**: Include practical applications and implications",
    "",
    "## Detailed Structure",
    "```markdown",
    "- Chapter Core Theme: [Comprehensive synthesis of the main topic]",
    "",
    "  - Key Concept 1: [Detailed definition in your own words]",
    "    - Why it matters: [Significance/relevance explained]",
    "    - How it works: [Detailed mechanism or process]",
    "    - Example from text: [Specific instance with context]",
    "    - Another example: [Additional instance]",
    "    - My own example: [Original application or analogy]",
    "    - Edge case: [When this might not apply]",
    "    - Connects to: [Explicit relationships to other concepts]",
    "    - Real-world application: [Practical use cases]",
    "",
    "  - Key Concept 2: [Comprehensive definition]",
    "    - Distinguishing features: [What makes this unique]",
    "    - Common misconceptions: [What people often get wrong]",
    "    - Historical context: [If relevant]",
    "    - Multiple examples: [Various illustrations]",
    "    - Implications: [What this means for broader understanding]",
    "```",
    "",
    GRADING_RUBRIC,
    "",
    "## Original Chapter",
    chapterText,
    "",
    "## User's Attempts (for context)",
    ...userAttempts.map((notes, i) => `### Attempt ${i + 1}\n${notes}\n`),
    "",
    "## Final Instructions",
    "1. Create an EXHAUSTIVE hierarchical summary with all details",
    "2. Every concept should have multiple supporting points and examples",
    "3. Show deep connections between ideas",
    "4. Include nuances, edge cases, and implications",
    "5. Demonstrate mastery through comprehensive coverage",
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
