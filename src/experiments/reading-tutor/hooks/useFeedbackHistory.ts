import { useState } from "react";
import type { Attempt } from "../schemas";

/**
 * Hook for managing feedback iteration history
 */
export function useFeedbackHistory() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  const addAttempt = (attempt: Omit<Attempt, "timestamp">) => {
    setAttempts((prev) => [
      ...prev,
      {
        ...attempt,
        timestamp: Date.now(),
      },
    ]);
  };

  const clearHistory = () => {
    setAttempts([]);
  };

  const getLatestAttempt = () => {
    return attempts.length > 0 ? attempts[attempts.length - 1] : null;
  };

  const getPreviousAttempts = () => {
    return attempts.map((attempt) => ({
      notes: attempt.notes,
      score: attempt.score,
      feedback: attempt.feedback,
    }));
  };

  return {
    attempts,
    addAttempt,
    clearHistory,
    getLatestAttempt,
    getPreviousAttempts,
  };
}
