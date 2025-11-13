import { useRef, useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { LoaderCircle } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import {
  Field,
  FieldError,
  FieldLabel,
} from "~/components/ui/field";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  createTweet,
  editWithLocks,
  operateOnTarget,
} from "~/experiments/ai-tweet-creator/server";
import { LockedHighlighter } from "~/experiments/ai-tweet-creator/components/LockedHighlighter";
import { PopClip } from "~/experiments/ai-tweet-creator/components/PopClip";
import { useSelectionBubble } from "~/experiments/ai-tweet-creator/hooks/useSelectionBubble";

const formSchema = z.object({
  idea: z.string().min(1, "Please enter an idea for the tweet"),
});

export function AiTweetCreator() {
  const [tweet, setTweet] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [locked, setLocked] = useState<string[]>([]);
  const tweetRef = useRef<HTMLDivElement | null>(null);
  const { bubble, setBubble, handleSelection, handleLockedMouseUp, close } =
    useSelectionBubble(tweetRef);

  const form = useForm({
    defaultValues: {
      idea: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsGenerating(true);
      try {
        const result =
          tweet.trim().length === 0
            ? await createTweet({ data: { idea: value.idea } })
            : await editWithLocks({
                data: { previous: tweet, locked, idea: value.idea },
              });
        setTweet(result.tweet);
        form.reset();
      } finally {
        setIsGenerating(false);
      }
    },
  });

  

  async function doOp(op: "rephrase" | "condense") {
    if (!bubble) return;
    setIsGenerating(true);
    try {
      const result = await operateOnTarget({
        data: {
          previous: tweet,
          locked: locked.filter((l) => l !== bubble.text),
          target: bubble.text,
          operation: op,
        },
      });
      setTweet(result.tweet);
      close();
    } finally {
      setIsGenerating(false);
    }
  }

  const removeLock = (t: string) =>
    setLocked((prev) => prev.filter((l) => l !== t));


  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Tweet Creator</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Generate engaging tweets from your ideas using Google Gemini
        </p>
      </div>

      {tweet && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Tweet</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <LockedHighlighter
                text={tweet}
                locked={locked}
                containerRef={tweetRef}
                onMouseUp={handleSelection}
                onLockedMouseUp={handleLockedMouseUp}
              />
              {bubble && (
                <PopClip
                  visible={true}
                  x={bubble.x}
                  y={bubble.y}
                  isLocked={locked.includes(bubble.text)}
                  disabled={isGenerating}
                  onLock={() => {
                    setLocked((prev) =>
                      prev.includes(bubble.text) ? prev : [...prev, bubble.text],
                    );
                    close();
                    window.getSelection()?.removeAllRanges();
                  }}
                  onUnlock={() => {
                    removeLock(bubble.text);
                    close();
                    window.getSelection()?.removeAllRanges();
                  }}
                  onRephrase={() => doOp("rephrase")}
                  onCondense={() => doOp("condense")}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4"
      >
        <form.Field name="idea">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Idea or topic</FieldLabel>
                <Textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="Describe the idea for the tweet"
                  className="min-h-28"
                  disabled={isGenerating}
                  aria-invalid={isInvalid}
                />
                {isInvalid && (
                  <FieldError errors={field.state.meta.errors} />
                )}
              </Field>
            );
          }}
        </form.Field>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            disabled={isGenerating || !form.state.canSubmit}
          >
            {isGenerating && (
              <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isGenerating ? "Generating..." : "Generate"}
          </Button>
          {tweet && (
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigator.clipboard.writeText(tweet)}
            >
              Copy
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
