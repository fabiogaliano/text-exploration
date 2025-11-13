import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";

interface ChapterViewerProps {
  chapterText: string;
  onChapterChange: (text: string) => void;
  disabled?: boolean;
}

/**
 * Component for viewing/pasting chapter text
 */
export function ChapterViewer({
  chapterText,
  onChapterChange,
  disabled = false,
}: ChapterViewerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Construct the new text with the pasted content
    const newText =
      chapterText.substring(0, start) +
      pastedText +
      chapterText.substring(end);

    onChapterChange(newText);

    // Set cursor position to the start of the pasted content
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.selectionStart = start;
        textareaRef.current.selectionEnd = start;
        textareaRef.current.focus();
      }
    }, 0);
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Chapter Text</CardTitle>
        <p className="text-muted-foreground text-sm">
          Paste the chapter content you want to summarize
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <Textarea
          ref={textareaRef}
          value={chapterText}
          onChange={(e) => onChapterChange(e.target.value)}
          onPaste={handlePaste}
          placeholder="Paste the chapter text here..."
          className="h-full resize-none font-serif text-sm leading-relaxed overflow-y-auto"
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
