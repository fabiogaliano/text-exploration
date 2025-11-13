import * as React from "react";

export type BubbleState = { x: number; y: number; text: string } | null;

export function useSelectionBubble(
  containerRef:
    | React.RefObject<HTMLElement>
    | React.MutableRefObject<HTMLElement | null>,
) {
  const [bubble, setBubble] = React.useState<BubbleState>(null);

  const handleSelection = React.useCallback(() => {
    const sel = window.getSelection?.();
    if (!sel || sel.isCollapsed) {
      setBubble(null);
      return;
    }
    const text = sel.toString();
    if (!text.trim()) {
      setBubble(null);
      return;
    }
    const container = containerRef.current;
    if (!container) {
      setBubble(null);
      return;
    }
    const anchorNode = sel.anchorNode;
    const focusNode = sel.focusNode;
    if (!anchorNode || !focusNode || !container.contains(anchorNode) || !container.contains(focusNode)) {
      setBubble(null);
      return;
    }
    const range = sel.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const x = rect.left - containerRect.left;
    const y = rect.top - containerRect.top - 8;
    setBubble({ x, y, text });
  }, [containerRef]);

  const handleLockedMouseUp = React.useCallback(
    (e: React.MouseEvent<HTMLElement>, text: string) => {
      e.preventDefault();
      e.stopPropagation();
      const container = containerRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const x = e.clientX - containerRect.left;
      const y = e.clientY - containerRect.top - 8;
      setBubble({ x, y, text });
    },
    [containerRef],
  );

  const close = React.useCallback(() => setBubble(null), []);

  return { bubble, setBubble, handleSelection, handleLockedMouseUp, close } as const;
}
