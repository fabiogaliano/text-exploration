import { useRef, useState } from "react";
import { XIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Textarea } from "~/components/ui/textarea";
import type { MultimodalContent, UserNotes } from "../schemas";
import { toMultimodalContent } from "../schemas";

interface NotesEditorProps {
  notes: UserNotes;
  onNotesChange: (content: MultimodalContent) => void;
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
  const content = toMultimodalContent(notes);

  const handleTextChange = (newText: string) => {
    onNotesChange({
      text: newText,
      images: content.images,
    });
  };

  const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const clipboardData = e.clipboardData;

    // Check for images in clipboard
    const items = Array.from(clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));

    if (imageItems.length > 0) {
      e.preventDefault();

      // Process all pasted images
      const newImages = await Promise.all(
        imageItems.map(async (item) => {
          const file = item.getAsFile();
          if (!file) return null;

          return new Promise<{ id: string; data: string; name: string } | null>(
            (resolve) => {
              const reader = new FileReader();
              reader.onload = (event) => {
                const data = event.target?.result as string;
                resolve({
                  id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                  data,
                  name: file.name || "pasted-image",
                });
              };
              reader.onerror = () => resolve(null);
              reader.readAsDataURL(file);
            }
          );
        })
      );

      const validImages = newImages.filter((img): img is NonNullable<typeof img> => img !== null);

      if (validImages.length > 0) {
        onNotesChange({
          text: content.text,
          images: [...content.images, ...validImages],
        });
      }
    } else {
      // Handle text paste as before
      e.preventDefault();
      const pastedText = clipboardData.getData("text");
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newText =
        content.text.substring(0, start) +
        pastedText +
        content.text.substring(end);

      onNotesChange({
        text: newText,
        images: content.images,
      });

      // Set cursor position
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = start;
          textareaRef.current.selectionEnd = start;
          textareaRef.current.focus();
        }
      }, 0);
    }
  };

  const handleRemoveImage = (imageId: string) => {
    onNotesChange({
      text: content.text,
      images: content.images.filter((img) => img.id !== imageId),
    });
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Your Notes</CardTitle>
        <p className="text-muted-foreground text-sm">
          Write your summary in your own words. You can paste images too!
        </p>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto flex flex-col gap-4">
        <Textarea
          ref={textareaRef}
          value={content.text}
          onChange={(e) => handleTextChange(e.target.value)}
          onPaste={handlePaste}
          placeholder="Write your chapter summary here..."
          className="min-h-[200px] resize-none text-sm leading-relaxed"
          disabled={disabled}
        />

        {content.images.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs text-muted-foreground font-medium">
              Attached Images ({content.images.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {content.images.map((image) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg border border-border overflow-hidden bg-muted"
                >
                  <img
                    src={image.data}
                    alt={image.name || "Pasted image"}
                    className="max-w-[200px] max-h-[200px] object-contain"
                  />
                  {!disabled && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveImage(image.id)}
                      type="button"
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
