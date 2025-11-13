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
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Your Notes</CardTitle>
        <p className="text-muted-foreground text-sm">
          Write your summary in your own words
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Write your chapter summary here..."
          className="h-full min-h-[400px] resize-none text-sm leading-relaxed"
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
