export const TWEET_RULES = "Write a concise, engaging tweet under 280 characters. No emojis. No hashtags unless essential.";

export function withTopic(idea?: string) {
  return idea && idea.trim().length > 0 ? "Topic: " + idea : undefined;
}

export function withPrevious(previous: string) {
  return "Start from this current draft:\n" + previous;
}

export function withLocks(locked: string[]) {
  if (!locked || locked.length === 0) return undefined;
  const parts = [
    "Preserve the following substrings exactly as written. Do not modify, remove, or reorder them:",
    ...locked.map((s) => "- " + s),
  ];
  return parts.join("\n");
}

export const OP_INSTRUCTIONS = {
  rephrase: "Rephrase the following target substring while preserving its meaning:",
  condense: "Condense the following target substring to be shorter while preserving its meaning:",
} as const;

export function buildInitialTweet({ idea }: { idea: string }) {
  const parts = [TWEET_RULES, withTopic(idea)].filter(Boolean) as string[];
  return parts.join("\n\n");
}

export function buildEditWithLocks({
  previous,
  locked,
  idea,
}: {
  previous: string;
  locked: string[];
  idea?: string;
}) {
  const parts = [TWEET_RULES, withTopic(idea), withPrevious(previous), withLocks(locked), "Return a single tweet under 280 characters."].filter(Boolean) as string[];
  return parts.join("\n\n");
}

export function buildTargetOperation({
  previous,
  target,
  operation,
  locked,
  idea,
}: {
  previous: string;
  target: string;
  operation: keyof typeof OP_INSTRUCTIONS;
  locked?: string[];
  idea?: string;
}) {
  const parts = [
    TWEET_RULES,
    withTopic(idea),
    withPrevious(previous),
    locked && locked.length ? withLocks(locked) : undefined,
    OP_INSTRUCTIONS[operation],
    "TARGET:\n" + target,
    "Modify only the first exact occurrence of the TARGET within the current draft. Return the FULL tweet with the modified target in place. Do not change any other text besides the target. Keep under 280 characters.",
  ].filter(Boolean) as string[];
  return parts.join("\n\n");
}

export function buildThreadPrompt({ idea, count, style }: { idea: string; count: number; style?: string }) {
  const parts = [
    "Write a Twitter/X thread.",
    "Rules:",
    "- Return ONLY valid JSON matching the provided schema.",
    "- Each tweet MUST be under 280 characters.",
    "- Avoid emojis.",
    "- Avoid hashtags unless essential.",
    `- Create exactly ${count} tweets that flow logically as a thread.`,
  ];
  if (style && style.trim().length > 0) parts.push("Style: " + style);
  parts.push("Topic: " + idea);
  return parts.join("\n");
}
