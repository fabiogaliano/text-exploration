import { useState, useEffect } from "react";
import { Bug, GripVertical, X } from "lucide-react";
import { Rnd } from "react-rnd";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "~/components/ui/tabs";
import { Button } from "~/components/ui/button";

interface DebugData {
  aiResponses?: {
    feedback?: string;
    strengths?: string[];
    improvements?: string[];
    idealSummary?: string;
    explanation?: string;
  };
  markdown?: {
    raw?: string;
    length?: number;
    hasLineBreaks?: boolean;
    hasBullets?: boolean;
  };
  state?: Record<string, any>;
}

interface StateControls {
  currentState: string;
  setState: (state: string) => void;
  mockFeedback: () => void;
  mockIdealSummary: () => void;
  mockConversation: () => void;
  mockAll: () => void;
  reset: () => void;
}

interface DevToolsPanelProps {
  data: DebugData;
  stateControls?: StateControls;
  children?: React.ReactNode;
}

export function DevToolsPanel({ data, stateControls, children }: DevToolsPanelProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 600, height: 550 });

  // Set initial position to bottom-right corner
  useEffect(() => {
    if (typeof window !== "undefined" && !position.x) {
      setPosition({
        x: window.innerWidth - 650,
        y: window.innerHeight - 600,
      });
    }
  }, [position.x]);

  return (
    <>
      {children}

      {/* Floating trigger button */}
      <Button
        size="icon"
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full shadow-lg"
        variant="secondary"
      >
        <Bug className="h-5 w-5" />
      </Button>

      {/* Draggable/Resizable Dev Tools Window */}
      {open && (
        <Rnd
          size={{ width: size.width, height: size.height }}
          position={{ x: position.x, y: position.y }}
          onDragStop={(e, d) => setPosition({ x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) => {
            setSize({
              width: parseInt(ref.style.width),
              height: parseInt(ref.style.height),
            });
            setPosition(position);
          }}
          minWidth={400}
          minHeight={300}
          bounds="window"
          dragHandleClassName="drag-handle"
          style={{ zIndex: 50 }}
          className="fixed bg-background border rounded-lg shadow-xl flex flex-col"
        >
          {/* Draggable Header */}
          <div className="drag-handle cursor-move border-b bg-muted/30 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <Bug className="h-5 w-5" />
              <div>
                <h2 className="text-lg font-semibold">Developer Tools</h2>
                <p className="text-sm text-muted-foreground">
                  Debug information and raw data inspection
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="controls" className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="controls">Controls</TabsTrigger>
                <TabsTrigger value="ai">AI Responses</TabsTrigger>
                <TabsTrigger value="markdown">Markdown</TabsTrigger>
                <TabsTrigger value="state">State</TabsTrigger>
              </TabsList>

              {/* Controls Tab */}
              <TabsContent value="controls" className="p-6 space-y-6 overflow-y-auto">
                {stateControls ? (
                  <>
                    <div className="space-y-6">
                      <div>
                        <h3 className="mb-3 text-base font-semibold text-foreground/90">Current State</h3>
                        <div className="bg-muted p-4 rounded-md">
                          <code className="text-sm font-medium">{stateControls.currentState}</code>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 text-base font-semibold text-foreground/90">Switch State</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => stateControls.setState("input")}
                            className={stateControls.currentState === "input" ? "border-primary" : ""}
                          >
                            Input
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => stateControls.setState("feedback")}
                            className={stateControls.currentState === "feedback" ? "border-primary" : ""}
                          >
                            Feedback
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => stateControls.setState("ideal-summary")}
                            className={stateControls.currentState === "ideal-summary" ? "border-primary" : ""}
                          >
                            Ideal Summary
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => stateControls.setState("conversation")}
                            className={stateControls.currentState === "conversation" ? "border-primary" : ""}
                          >
                            Conversation
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h3 className="mb-3 text-base font-semibold text-foreground/90">Mock Data</h3>
                        <div className="space-y-3">
                          <Button
                            variant="default"
                            size="sm"
                            onClick={stateControls.mockAll}
                            className="w-full justify-start"
                          >
                            Fill All
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={stateControls.mockFeedback}
                            className="w-full justify-start"
                          >
                            Feedback
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={stateControls.mockIdealSummary}
                            className="w-full justify-start"
                          >
                            Ideal Summary
                          </Button>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={stateControls.mockConversation}
                            className="w-full justify-start"
                          >
                            Conversation
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={stateControls.reset}
                          className="w-full"
                        >
                          Reset All Data
                        </Button>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No state controls available
                  </p>
                )}
              </TabsContent>

              {/* AI Responses Tab */}
              <TabsContent value="ai" className="p-6 space-y-6 overflow-y-auto">
                {data.aiResponses?.feedback && (
                  <div>
                    <h3 className="mb-3 text-base font-semibold text-foreground/90">Raw Feedback</h3>
                    <pre className="overflow-x-auto bg-muted p-4 rounded-md text-xs whitespace-pre-wrap">
                      {data.aiResponses.feedback}
                    </pre>
                  </div>
                )}

                {data.aiResponses?.strengths && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-3 text-base font-semibold text-foreground/90">Strengths Array</h3>
                      <pre className="overflow-x-auto bg-muted p-4 rounded-md text-xs">
                        {JSON.stringify(data.aiResponses.strengths, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Markdown format:
                      </p>
                      <pre className="overflow-x-auto bg-muted p-4 rounded-md text-xs">
                        {data.aiResponses.strengths.map(s => `- ${s}`).join('\n')}
                      </pre>
                    </div>
                  </div>
                )}

                {data.aiResponses?.improvements && (
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-3 text-base font-semibold text-foreground/90">Improvements Array</h3>
                      <pre className="overflow-x-auto bg-muted p-4 rounded-md text-xs">
                        {JSON.stringify(data.aiResponses.improvements, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Markdown format:
                      </p>
                      <pre className="overflow-x-auto bg-muted p-4 rounded-md text-xs">
                        {data.aiResponses.improvements.map(i => `- ${i}`).join('\n')}
                      </pre>
                    </div>
                  </div>
                )}

                {data.aiResponses?.idealSummary && (
                  <div>
                    <h3 className="mb-3 text-base font-semibold text-foreground/90">Ideal Summary</h3>
                    <pre className="overflow-x-auto bg-muted p-4 rounded-md text-xs whitespace-pre-wrap">
                      {data.aiResponses.idealSummary}
                    </pre>
                  </div>
                )}

                {data.aiResponses?.explanation && (
                  <div>
                    <h3 className="mb-3 text-base font-semibold text-foreground/90">Explanation</h3>
                    <pre className="overflow-x-auto bg-muted p-4 rounded-md text-xs whitespace-pre-wrap">
                      {data.aiResponses.explanation}
                    </pre>
                  </div>
                )}
              </TabsContent>

              {/* Markdown Tab */}
              <TabsContent value="markdown" className="p-6 space-y-6 overflow-y-auto">
                {data.markdown?.raw && (
                  <>
                    <div>
                      <h3 className="mb-3 text-base font-semibold text-foreground/90">Metadata</h3>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-muted/50 p-3 rounded-md">
                          <span className="font-medium">Length:</span>{" "}
                          <span className="text-muted-foreground">{data.markdown.length} chars</span>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <span className="font-medium">Line breaks:</span>{" "}
                          <span className="text-muted-foreground">{data.markdown.hasLineBreaks ? "Yes" : "No"}</span>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-md">
                          <span className="font-medium">Bullets:</span>{" "}
                          <span className="text-muted-foreground">{data.markdown.hasBullets ? "Yes" : "No"}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="mb-3 text-base font-semibold text-foreground/90">Raw Markdown</h3>
                      <pre className="overflow-x-auto bg-muted p-4 rounded-md text-xs whitespace-pre-wrap">
                        {data.markdown.raw}
                      </pre>
                    </div>
                  </>
                )}
              </TabsContent>

              {/* State Tab */}
              <TabsContent value="state" className="p-6 space-y-6 overflow-y-auto">
                {data.state && Object.keys(data.state).length > 0 ? (
                  <div>
                    <h3 className="mb-3 text-base font-semibold text-foreground/90">Component State</h3>
                    <pre className="overflow-x-auto bg-muted p-4 rounded-md text-xs">
                      {JSON.stringify(data.state, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No state data available</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </Rnd>
      )}
    </>
  );
}
