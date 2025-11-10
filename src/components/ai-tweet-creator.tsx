import { useState } from "react";
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
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { generateTweet } from "~/experiments/ai-tweet-creator/server";

const formSchema = z.object({
  idea: z.string().min(1, "Please enter an idea for the tweet"),
});

export function AiTweetCreator() {
  const [tweet, setTweet] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const form = useForm({
    defaultValues: {
      idea: "",
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      setIsGenerating(true);
      setTweet("");
      try {
        const result = await generateTweet({ data: value });
        setTweet(result.tweet);
        form.reset();
      } finally {
        setIsGenerating(false);
      }
    },
  });

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">AI Tweet Creator</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Generate engaging tweets from your ideas using Google Gemini
        </p>
      </div>

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

      {tweet && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Tweet</CardTitle>
            <CardDescription>
              Ready to post or copy to your clipboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{tweet}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
