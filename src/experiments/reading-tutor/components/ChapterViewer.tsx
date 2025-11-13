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
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Chapter Text</CardTitle>
        <p className="text-muted-foreground text-sm">
          Paste the chapter content you want to summarize
        </p>
      </CardHeader>
      <CardContent className="flex-1">
        <Textarea
          value={chapterText}
          onChange={(e) => onChapterChange(e.target.value)}
          placeholder="Paste the chapter text here..."
          className="h-full min-h-[400px] resize-none font-serif text-sm leading-relaxed"
          disabled={disabled}
        />
      </CardContent>
    </Card>
  );
}
