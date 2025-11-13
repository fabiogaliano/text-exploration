import * as React from "react";
import { computeSegments } from "../lib/segments";

export function LockedHighlighter({
  text,
  locked,
  containerRef,
  onMouseUp,
  onLockedMouseUp,
}: {
  text: string;
  locked: string[];
  containerRef: React.Ref<HTMLDivElement>;
  onMouseUp: React.MouseEventHandler<HTMLDivElement>;
  onLockedMouseUp: (e: React.MouseEvent<HTMLSpanElement>, text: string) => void;
}) {
  const segments = React.useMemo(() => computeSegments(text, locked), [text, locked]);

  return (
    <div ref={containerRef} className="whitespace-pre-wrap" onMouseUp={onMouseUp}>
      {segments.map((seg, i) =>
        seg.locked ? (
          <span
            key={i}
            className="cursor-pointer rounded bg-secondary px-1 py-0.5"
            onMouseUp={(e) => onLockedMouseUp(e, seg.text)}
            aria-label="Locked segment, click for options"
            title="Options"
          >
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </div>
  );
}
