import { useState } from "react";
import { LoaderCircle, BookOpen, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { ChapterViewer } from "~/experiments/reading-tutor/components/ChapterViewer";
import { NotesEditor } from "~/experiments/reading-tutor/components/NotesEditor";
import { FeedbackDisplay } from "~/experiments/reading-tutor/components/FeedbackDisplay";
import { useFeedbackHistory } from "~/experiments/reading-tutor/hooks/useFeedbackHistory";
import {
  analyzeSummary,
  reanalyze,
  generateIdealSummary,
  answerQuestion,
} from "~/experiments/reading-tutor/server";

type Mode = "editing" | "feedback" | "conversation" | "ideal-summary";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export function ReadingTutor() {
  // Core state
  const [chapterText, setChapterText] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [mode, setMode] = useState<Mode>("editing");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Feedback state
  const {
    attempts,
    addAttempt,
    clearHistory,
    getLatestAttempt,
    getPreviousAttempts,
  } = useFeedbackHistory();

  // Conversation state
  const [conversationHistory, setConversationHistory] = useState<
    ConversationMessage[]
  >([]);
  const [currentQuestion, setCurrentQuestion] = useState("");

  // Ideal summary state
  const [idealSummary, setIdealSummary] = useState<{
    summary: string;
    explanation: string;
  } | null>(null);

  const latestAttempt = getLatestAttempt();

  // Handle submit for analysis
  const handleSubmit = async () => {
    if (!chapterText.trim() || !userNotes.trim()) return;

    setIsAnalyzing(true);
    try {
      if (attempts.length === 0) {
        // First analysis
        const result = await analyzeSummary({
          data: { chapterText, userNotes },
        });

        addAttempt({
          notes: userNotes,
          score: result.score,
          feedback: result.feedback,
          strengths: result.strengths,
          improvements: result.improvements,
        });
      } else {
        // Re-analysis with context
        const result = await reanalyze({
          data: {
            chapterText,
            userNotes,
            previousAttempts: getPreviousAttempts(),
          },
        });

        addAttempt({
          notes: userNotes,
          score: result.score,
          feedback: result.feedback,
          strengths: result.strengths,
          improvements: result.improvements,
        });
      }

      setMode("feedback");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle showing ideal summary
  const handleShowIdeal = async () => {
    if (!chapterText.trim() || attempts.length === 0) return;

    setIsAnalyzing(true);
    try {
      const result = await generateIdealSummary({
        data: {
          chapterText,
          userAttempts: attempts.map((a) => a.notes),
        },
      });

      setIdealSummary({
        summary: result.idealSummary,
        explanation: result.explanation,
      });
      setMode("ideal-summary");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle asking question
  const handleAskQuestion = async () => {
    if (!currentQuestion.trim()) return;

    setIsAnalyzing(true);
    try {
      const result = await answerQuestion({
        data: {
          chapterText,
          userNotes,
          conversationHistory,
          question: currentQuestion,
        },
      });

      setConversationHistory((prev) => [
        ...prev,
        { role: "user", content: currentQuestion },
        { role: "assistant", content: result.answer },
      ]);
      setCurrentQuestion("");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle starting over
  const handleStartOver = () => {
    setChapterText("");
    setUserNotes("");
    clearHistory();
    setConversationHistory([]);
    setIdealSummary(null);
    setMode("editing");
  };

  // Handle revise & resubmit
  const handleRevise = () => {
    setMode("editing");
    setConversationHistory([]);
    setIdealSummary(null);
  };

  const canSubmit = chapterText.trim().length > 0 && userNotes.trim().length > 0;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-2xl font-semibold">Reading Tutor</h1>
        </div>
        <p className="text-muted-foreground mt-1 text-sm">
          Improve your reading comprehension with AI-powered feedback
        </p>
      </div>

      {/* Main Content - Side by Side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChapterViewer
          chapterText={chapterText}
          onChapterChange={setChapterText}
          disabled={isAnalyzing}
        />
        <NotesEditor
          notes={userNotes}
          onNotesChange={setUserNotes}
          disabled={isAnalyzing}
        />
      </div>

      {/* Submit Button */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || isAnalyzing}
          size="lg"
        >
          {isAnalyzing && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
          {isAnalyzing
            ? "Analyzing..."
            : attempts.length === 0
              ? "Get Feedback"
              : "Resubmit"}
        </Button>
        {attempts.length > 0 && (
          <Button variant="outline" onClick={handleStartOver}>
            Start Over
          </Button>
        )}
      </div>

      {/* Feedback Section */}
      {latestAttempt && mode === "feedback" && (
        <div className="space-y-4">
          <FeedbackDisplay
            analysis={latestAttempt}
            attemptNumber={attempts.length}
          />

          {/* Action Buttons */}
          <Card>
            <CardContent className="flex flex-wrap gap-3 pt-6">
              <Button variant="default" onClick={handleRevise}>
                Revise & Resubmit
              </Button>
              <Button
                variant="outline"
                onClick={handleShowIdeal}
                disabled={isAnalyzing}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Show Ideal Answer
              </Button>
              <Button
                variant="outline"
                onClick={() => setMode("conversation")}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Ask AI Tutor
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ideal Summary Display */}
      {idealSummary && mode === "ideal-summary" && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Ideal Summary Example</h3>
              <div className="bg-muted rounded-lg p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {idealSummary.summary}
                </p>
              </div>
            </div>
            <div>
              <h4 className="mb-2 font-semibold">Why This Works</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {idealSummary.explanation}
              </p>
            </div>
            <Button variant="outline" onClick={() => setMode("feedback")}>
              Back to Feedback
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Conversation Mode */}
      {mode === "conversation" && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <div>
              <h3 className="mb-2 text-lg font-semibold">Ask the AI Tutor</h3>
              <p className="text-muted-foreground text-sm">
                Ask questions about the chapter, your notes, or how to improve your
                understanding.
              </p>
            </div>

            {/* Conversation History */}
            {conversationHistory.length > 0 && (
              <div className="space-y-3">
                {conversationHistory.map((msg, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-3 ${
                      msg.role === "user"
                        ? "bg-primary/10 ml-8"
                        : "bg-muted mr-8"
                    }`}
                  >
                    <div className="mb-1 text-xs font-semibold uppercase">
                      {msg.role === "user" ? "You" : "AI Tutor"}
                    </div>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Question Input */}
            <div className="flex gap-2">
              <Textarea
                value={currentQuestion}
                onChange={(e) => setCurrentQuestion(e.target.value)}
                placeholder="Ask a question..."
                className="min-h-20"
                disabled={isAnalyzing}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAskQuestion();
                  }
                }}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleAskQuestion}
                disabled={!currentQuestion.trim() || isAnalyzing}
              >
                {isAnalyzing && (
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                )}
                Ask
              </Button>
              <Button variant="outline" onClick={() => setMode("feedback")}>
                Back to Feedback
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Attempts (Collapsible) */}
      {attempts.length > 1 && (
        <details className="group">
          <summary className="text-muted-foreground cursor-pointer text-sm">
            View previous attempts ({attempts.length - 1})
          </summary>
          <div className="mt-4 space-y-4">
            {attempts.slice(0, -1).map((attempt, index) => (
              <FeedbackDisplay
                key={attempt.timestamp}
                analysis={attempt}
                attemptNumber={index + 1}
              />
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
