import { useState } from "react";
import { Streamdown } from "streamdown";
import { LoaderCircle, BookOpen, Sparkles, MessageCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "~/components/ui/tabs";
import { DevToolsPanel } from "~/components/dev-tools-panel";
import { ChapterViewer } from "~/experiments/reading-tutor/components/ChapterViewer";
import { NotesEditor } from "~/experiments/reading-tutor/components/NotesEditor";
import { FeedbackDisplay } from "~/experiments/reading-tutor/components/FeedbackDisplay";
import { useFeedbackHistory } from "~/experiments/reading-tutor/hooks/useFeedbackHistory";
import {
  analyzeSummary,
  reanalyze,
  generateIdealSummary,
  generateExtendedSummary,
  answerQuestion,
} from "~/experiments/reading-tutor/server";

type Mode = "input" | "feedback" | "conversation" | "ideal-summary";

interface ConversationMessage {
  role: "user" | "assistant";
  content: string;
}

export function ReadingTutor() {
  // Core state
  const [chapterText, setChapterText] = useState("");
  const [userNotes, setUserNotes] = useState("");
  const [mode, setMode] = useState<Mode>("input");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [availableTabs, setAvailableTabs] = useState<Set<string>>(new Set());

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
    concise: string | null;
    extended: string | null;
    activeVersion: 'concise' | 'extended';
  } | null>(null);
  const [isGeneratingExtended, setIsGeneratingExtended] = useState(false);

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
      setAvailableTabs(new Set(["input", "feedback"]));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle showing ideal summary (concise version)
  const handleShowIdeal = async () => {
    if (!chapterText.trim() || attempts.length === 0) return;

    setIsAnalyzing(true);
    try {
      const result = await generateIdealSummary({
        data: {
          chapterText,
          userAttempts: attempts.map((a) => a.notes),
          version: "concise",
        },
      });

      setIdealSummary({
        concise: result.idealSummary,
        extended: null,
        activeVersion: 'concise',
      });
      setMode("ideal-summary");
      setAvailableTabs((prev) => new Set([...prev, "ideal-summary"]));
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Handle generating extended summary
  const handleGenerateExtended = async () => {
    if (!chapterText.trim() || attempts.length === 0) return;

    setIsGeneratingExtended(true);
    try {
      const result = await generateExtendedSummary({
        data: {
          chapterText,
          userAttempts: attempts.map((a) => a.notes),
        },
      });

      setIdealSummary((prev) => prev ? {
        ...prev,
        extended: result.idealSummary,
        activeVersion: 'extended',
      } : null);
    } finally {
      setIsGeneratingExtended(false);
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
    setMode("input");
    setAvailableTabs(new Set());
  };

  // Handle revise & resubmit
  const handleRevise = () => {
    setMode("input");
    setConversationHistory([]);
    setIdealSummary(null);
  };

  // Handle entering conversation mode
  const handleEnterConversation = () => {
    setMode("conversation");
    setAvailableTabs((prev) => new Set([...prev, "conversation"]));
  };

  // Mock data functions for dev tools
  const mockFeedback = () => {
    const mockAttempt = {
      notes: "This is a mock summary about Morse code and communication systems.",
      score: 75,
      feedback: "Good effort! You've captured some key concepts about communication encoding.",
      strengths: [
        "Identified the core concept of signal encoding",
        "Mentioned Morse code as a temporal system",
        "Understood the importance of shared protocols"
      ],
      improvements: [
        "Add more details about dots and dashes",
        "Explain the efficiency gains over simple systems",
        "Include examples of other communication codes"
      ],
      timestamp: Date.now()
    };
    addAttempt(mockAttempt);
    setMode("feedback");
    setAvailableTabs(new Set(["input", "feedback"]));
  };

  const mockIdealSummary = () => {
    setIdealSummary({
      concise: "- **Core Theme**: Humans need efficient codes to communicate over distance.\n\n- **Morse Code**: Uses dots and dashes instead of counting - reduces 'How are you?' from 131 to 32 blinks.\n  - Timing matters: pauses distinguish dots, letters, words\n\n- **Binary Principle**: Any information can be encoded with just two distinct elements.",
      extended: "- **Chapter Core Theme**: The fundamental human drive to communicate necessitates efficient, structured systems or 'codes' to overcome limitations of physical methods.\n\n- **Communication Fundamentals**: Humans have an inherent need to communicate over distance.\n  - Example from text: 10-year-old friends needing to share thoughts after bedtime\n  - Initial methods often inefficient: waving from windows, flashlight drawing\n  - My own example: Explaining complex ideas with only emojis becomes ambiguous\n\n- **Early Attempts**: Simple systems like counting blinks (1 for A, 2 for B) proved extremely inefficient.\n  - Problem: 'How are you?' required 131 blinks!\n  - Lacks provision for punctuation\n  - My own example: Counting to 100 to represent '100' is cumbersome\n\n- **Morse Code Innovation**: Uses two signal types (dots and dashes) to encode information efficiently.\n  - Efficiency gain: Same phrase needs only 32 blinks\n  - Temporal encoding: Pauses between dots/dashes, letters, words create meaning\n  - Common codes: SOS (···---···), V for Victory (···-)\n  - Optimized design: Common letters (E, T) have shorter codes\n\n- **Universal Binary Principle**: Any information can be conveyed using just two distinct states.\n  - Foundation of all digital computing\n  - Examples: on/off, 1/0, dot/dash, dih/dah",
      activeVersion: 'concise',
    });
    setMode("ideal-summary");
    setAvailableTabs((prev) => new Set([...prev, "ideal-summary"]));
  };

  const mockConversation = () => {
    setConversationHistory([
      {
        role: "user",
        content: "Can you explain why Morse code is more efficient than counting blinks?"
      },
      {
        role: "assistant",
        content: "Great question! Morse code is more efficient because it uses two types of signals (dots and dashes) combined with timing, rather than counting individual blinks. For example, the letter 'E' is just one short blink (dot), while in a counting system it would be 5 blinks. This compression gets even more dramatic for common letters, which are assigned shorter codes."
      },
      {
        role: "user",
        content: "What are some other examples of codes mentioned in the chapter?"
      },
      {
        role: "assistant",
        content: "The chapter discusses several human communication codes:\n\n- **Spoken language**: Using mouth sounds to form words\n- **Written text**: Representing words on paper or screens\n- **Sign languages** (ASL, LSQ): Hand and arm movements\n- **Braille**: Raised dots for tactile reading\n- **Stenography**: Shorthand for rapid transcription\n\nEach code serves a specific purpose based on the communication context."
      }
    ]);
    setMode("conversation");
    setAvailableTabs((prev) => new Set([...prev, "conversation"]));
  };

  const mockAll = () => {
    // Fill all mock data at once
    const mockAttempt = {
      notes: "This is a mock summary about Morse code and communication systems.",
      score: 75,
      feedback: "Good effort! You've captured some key concepts about communication encoding.",
      strengths: [
        "Identified the core concept of signal encoding",
        "Mentioned Morse code as a temporal system",
        "Understood the importance of shared protocols"
      ],
      improvements: [
        "Add more details about dots and dashes",
        "Explain the efficiency gains over simple systems",
        "Include examples of other communication codes"
      ],
      timestamp: Date.now()
    };
    addAttempt(mockAttempt);

    setIdealSummary({
      concise: "- **Core Theme**: Humans need efficient codes to communicate over distance.\n\n- **Morse Code**: Uses dots and dashes instead of counting - reduces 'How are you?' from 131 to 32 blinks.\n  - Timing matters: pauses distinguish dots, letters, words\n\n- **Binary Principle**: Any information can be encoded with just two distinct elements.",
      extended: null,
      activeVersion: 'concise',
    });

    setConversationHistory([
      {
        role: "user",
        content: "Can you explain why Morse code is more efficient than counting blinks?"
      },
      {
        role: "assistant",
        content: "Great question! Morse code is more efficient because it uses two types of signals (dots and dashes) combined with timing, rather than counting individual blinks. For example, the letter 'E' is just one short blink (dot), while in a counting system it would be 5 blinks. This compression gets even more dramatic for common letters, which are assigned shorter codes."
      },
      {
        role: "user",
        content: "What are some other examples of codes mentioned in the chapter?"
      },
      {
        role: "assistant",
        content: "The chapter discusses several human communication codes:\n\n- **Spoken language**: Using mouth sounds to form words\n- **Written text**: Representing words on paper or screens\n- **Sign languages** (ASL, LSQ): Hand and arm movements\n- **Braille**: Raised dots for tactile reading\n- **Stenography**: Shorthand for rapid transcription\n\nEach code serves a specific purpose based on the communication context."
      }
    ]);

    setMode("feedback");
    setAvailableTabs(new Set(["input", "feedback", "ideal-summary", "conversation"]));
  };

  const resetMockData = () => {
    setChapterText("");
    setUserNotes("");
    clearHistory();
    setConversationHistory([]);
    setIdealSummary(null);
    setMode("input");
    setAvailableTabs(new Set());
  };

  const canSubmit = chapterText.trim().length > 0 && userNotes.trim().length > 0;

  // Prepare debug data for DevToolsPanel
  const debugData = {
    aiResponses: latestAttempt
      ? {
          feedback: latestAttempt.feedback,
          strengths: latestAttempt.strengths,
          improvements: latestAttempt.improvements,
        }
      : idealSummary
      ? {
          idealSummary: idealSummary.activeVersion === 'concise'
            ? idealSummary.concise
            : idealSummary.extended,
        }
      : {},
    markdown: idealSummary
      ? {
          raw: idealSummary.activeVersion === 'concise'
            ? idealSummary.concise
            : idealSummary.extended || '',
          length: (idealSummary.activeVersion === 'concise'
            ? idealSummary.concise
            : idealSummary.extended || '').length,
          hasLineBreaks: (idealSummary.activeVersion === 'concise'
            ? idealSummary.concise
            : idealSummary.extended || '').includes('\n'),
          hasBullets: (idealSummary.activeVersion === 'concise'
            ? idealSummary.concise
            : idealSummary.extended || '').includes('- '),
        }
      : {},
    state: {
      mode,
      attemptCount: attempts.length,
      hasChapterText: chapterText.length > 0,
      hasUserNotes: userNotes.length > 0,
      conversationLength: conversationHistory.length,
      idealSummaryVersion: idealSummary?.activeVersion,
      hasExtendedSummary: idealSummary?.extended !== null,
    },
  };

  return (
    <DevToolsPanel
      data={debugData}
      stateControls={{
        currentState: mode,
        setState: setMode as (state: string) => void,
        mockFeedback,
        mockIdealSummary,
        mockConversation,
        mockAll,
        reset: resetMockData,
      }}
    >
      <div className="bg-muted/30 flex h-full w-full max-w-[1000px] mx-auto flex-col gap-6 overflow-hidden">
        {/* Before submission: Show input standalone */}
        {!latestAttempt && (
          <div className="flex flex-1 flex-col gap-4 overflow-hidden">
            <div className="grid flex-1 grid-cols-1 gap-6 lg:grid-cols-2">
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
                  : "Get Feedback"}
              </Button>
            </div>
          </div>
        )}

        {/* After submission: Show all tabs */}
        {latestAttempt && availableTabs.size > 0 && (
          <div className="flex-1 overflow-hidden">
            <Tabs value={mode} onValueChange={(value) => setMode(value as Mode)} className="flex h-full flex-col">
              <TabsList>
                <TabsTrigger value="input">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Input
                </TabsTrigger>
                <TabsTrigger value="feedback">
                  Feedback
                </TabsTrigger>
                <TabsTrigger value="ideal-summary" disabled={!availableTabs.has("ideal-summary")}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Ideal Answer
                </TabsTrigger>
                <TabsTrigger value="conversation" disabled={!availableTabs.has("conversation")}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Ask Tutor
                </TabsTrigger>
              </TabsList>

              {/* Input Tab */}
              <TabsContent value="input" className="flex-1 overflow-auto p-4">
                <div className="flex flex-col gap-4 h-full">
                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 flex-1">
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
                        : "Resubmit"}
                    </Button>
                    <Button variant="outline" onClick={handleStartOver}>
                      Start Over
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Feedback Tab */}
              <TabsContent value="feedback" className="flex-1 overflow-auto p-4">
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
                        onClick={handleEnterConversation}
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Ask AI Tutor
                      </Button>
                    </CardContent>
                  </Card>

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
              </TabsContent>

              {/* Ideal Summary Tab */}
              <TabsContent value="ideal-summary" className="flex-1 overflow-auto p-4">
                {idealSummary && (
                  <Card>
                    <CardContent className="space-y-4 pt-6">
                      <h3 className="mb-2 text-lg font-semibold">Ideal Summary Example</h3>

                      {/* Nested tabs for versions */}
                      <Tabs
                        value={idealSummary.activeVersion}
                        onValueChange={(value) => {
                          // Always update the active version
                          setIdealSummary((prev) => prev ? {
                            ...prev,
                            activeVersion: value as 'concise' | 'extended',
                          } : null);

                          // Only generate extended if it doesn't exist
                          if (value === 'extended' && !idealSummary.extended && !isGeneratingExtended) {
                            handleGenerateExtended();
                          }
                        }}
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="concise">Bullet Points</TabsTrigger>
                          <TabsTrigger value="extended">
                            {isGeneratingExtended && (
                              <LoaderCircle className="mr-2 h-3 w-3 animate-spin" />
                            )}
                            Extended
                          </TabsTrigger>
                        </TabsList>

                        <TabsContent value="concise" className="mt-4">
                          <div className="bg-muted rounded-lg p-6">
                            <div className="text-sm">
                              <Streamdown isAnimating={false}>
                                {idealSummary.concise || "Loading..."}
                              </Streamdown>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="extended" className="mt-4">
                          {idealSummary.extended ? (
                            <div className="bg-muted rounded-lg p-6">
                              <div className="text-sm">
                                <Streamdown isAnimating={false}>
                                  {idealSummary.extended}
                                </Streamdown>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8">
                              {isGeneratingExtended ? (
                                <>
                                  <LoaderCircle className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
                                  <p className="text-sm text-muted-foreground">
                                    Generating extended version...
                                  </p>
                                </>
                              ) : (
                                <>
                                  <p className="text-sm text-muted-foreground mb-3">
                                    Extended version not generated yet
                                  </p>
                                  <Button onClick={handleGenerateExtended} size="sm">
                                    Generate Extended Version
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Conversation Tab */}
              <TabsContent value="conversation" className="flex-1 overflow-auto p-4">
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
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                              <Streamdown isAnimating={false}>{msg.content}</Streamdown>
                            </div>
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
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </DevToolsPanel>
  );
}
