import { useRef, useState } from "react";
import { XIcon, Loader2 } from "lucide-react";
import imageCompression from "browser-image-compression";
import heic2any from "heic2any";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
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
 * Detect if a file is HEIC format
 */
function isHeicFormat(file: File): boolean {
  return (
    file.type === "image/heic" ||
    file.type === "image/heif" ||
    file.name.toLowerCase().endsWith(".heic") ||
    file.name.toLowerCase().endsWith(".heif")
  );
}

/**
 * Convert HEIC image to JPEG
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  if (!isHeicFormat(file)) {
    return file;
  }

  try {
    const convertedBlob = await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.9,
    });

    // heic2any can return Blob or Blob[], handle both cases
    const blob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;

    return new File([blob], file.name.replace(/\.heic$/i, ".jpg"), {
      type: "image/jpeg",
    });
  } catch (error) {
    console.error("HEIC conversion failed:", error);
    throw new Error("Failed to convert HEIC image. Please save as JPEG or PNG from your device.");
  }
}

/**
 * Compress image to reduce file size
 */
async function compressImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.5, // Target 500KB max
    maxWidthOrHeight: 1920, // Sufficient for AI vision models
    useWebWorker: true, // Non-blocking compression
    fileType: "image/jpeg" as const, // JPEG more efficient for photos
    initialQuality: 0.85, // Good balance of quality/size
  };

  try {
    const compressedFile = await imageCompression(file, options);
    console.log(
      `Compressed image: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`
    );
    return compressedFile;
  } catch (error) {
    console.warn("Compression failed, using original:", error);
    return file; // Fallback to original if compression fails
  }
}

/**
 * Process image: convert HEIC if needed, then compress
 */
async function processImage(file: File): Promise<File> {
  const converted = await convertHeicToJpeg(file);
  return await compressImage(converted);
}

/**
 * Format file size in human-readable format
 */
function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return "Unknown size";

  if (bytes < 1024) {
    return `${bytes} B`;
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  } else {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
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
  const [isProcessingImages, setIsProcessingImages] = useState(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

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
      setIsProcessingImages(true);
      setProcessingError(null);

      try {
        // Process all pasted images with compression and HEIC conversion
        const newImages = await Promise.all(
          imageItems.map(async (item) => {
            const file = item.getAsFile();
            if (!file) return null;

            try {
              // Process image: convert HEIC + compress
              const processedFile = await processImage(file);

              return new Promise<{ id: string; data: string; name: string; size: number } | null>(
                (resolve) => {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const data = event.target?.result as string;
                    resolve({
                      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
                      data,
                      name: processedFile.name || "pasted-image.jpg",
                      size: processedFile.size,
                    });
                  };
                  reader.onerror = () => resolve(null);
                  reader.readAsDataURL(processedFile);
                }
              );
            } catch (error) {
              console.error("Failed to process image:", error);
              setProcessingError(error instanceof Error ? error.message : "Failed to process image");
              return null;
            }
          })
        );

        const validImages = newImages.filter((img): img is NonNullable<typeof img> => img !== null);

        if (validImages.length > 0) {
          onNotesChange({
            text: content.text,
            images: [...content.images, ...validImages],
          });
        }
      } catch (error) {
        console.error("Error processing pasted images:", error);
        setProcessingError("Failed to process pasted images");
      } finally {
        setIsProcessingImages(false);
      }
    }
    // Let browser handle text paste natively to preserve undo/redo
  };

  const handleRemoveImage = (imageId: string) => {
    onNotesChange({
      text: content.text,
      images: content.images.filter((img) => img.id !== imageId),
    });
  };

  const handleImageClick = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Your Notes</CardTitle>
        <p className="text-muted-foreground text-sm">
          Write your summary in your own words. You can paste images too!
        </p>
        {isProcessingImages && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing image (compressing & converting)...</span>
          </div>
        )}
        {processingError && (
          <div className="text-sm text-destructive mt-2 p-2 bg-destructive/10 rounded">
            {processingError}
          </div>
        )}
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
              {content.images.map((image, index) => (
                <div
                  key={image.id}
                  className="relative group rounded-lg border border-border overflow-hidden bg-muted"
                >
                  {image.size && (
                    <div className="absolute top-1 left-1 z-10 bg-black/70 text-white text-xs px-2 py-0.5 rounded pointer-events-none">
                      {formatFileSize(image.size)}
                    </div>
                  )}
                  <img
                    src={image.data}
                    alt={image.name || "Pasted image"}
                    className="max-w-[200px] max-h-[200px] object-contain cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => handleImageClick(index)}
                  />
                  {!disabled && (
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity z-20"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(image.id);
                      }}
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

      {/* Lightbox for viewing images full-size with gallery navigation */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={content.images.map((image) => ({
          src: image.data,
          alt: image.name || "Image",
        }))}
      />
    </Card>
  );
}
