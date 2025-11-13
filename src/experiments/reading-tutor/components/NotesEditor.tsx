import { useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";

interface NotesEditorProps {
  notes: string;
  onNotesChange: (text: string) => void;
  disabled?: boolean;
}

/**
 * Component for writing/editing user notes
 */
export function NotesEditor({
  notes,
  onNotesChange,
  disabled = false,
}: NotesEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData("text");
    const textarea = e.currentTarget;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Construct the new text with the pasted content
    const newText =
      notes.substring(0, start) +
      pastedText +
      notes.substring(end);

    onNotesChange(newText);

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
        <CardTitle>Your Notes</CardTitle>
        <p className="text-muted-foreground text-sm">
          Write your summary in your own words
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        <Textarea
          ref={textareaRef}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onPaste={handlePaste}
          placeholder="Write your chapter summary here..."
          className="h-full resize-none text-sm leading-relaxed overflow-y-auto"
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
