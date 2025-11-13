import { Lock, Unlock } from "lucide-react";

export function PopClip({
  visible,
  x,
  y,
  isLocked,
  disabled,
  onLock,
  onUnlock,
  onRephrase,
  onCondense,
}: {
  visible: boolean;
  x: number;
  y: number;
  isLocked: boolean;
  disabled?: boolean;
  onLock: () => void;
  onUnlock: () => void;
  onRephrase: () => void;
  onCondense: () => void;
}) {
  if (!visible) return null;
  return (
    <div
      className="absolute z-20 -translate-y-full rounded-md border bg-background shadow-xs"
      style={{ left: x, top: y }}
    >
      <div className="flex items-stretch">
        {isLocked ? (
          <button
            className="flex items-center gap-2 px-2 py-1 text-sm"
            onClick={onUnlock}
            disabled={disabled}
          >
            <Unlock className="h-4 w-4" />
            Unlock
          </button>
        ) : (
          <button
            className="flex items-center gap-2 px-2 py-1 text-sm"
            onClick={onLock}
            disabled={disabled}
          >
            <Lock className="h-4 w-4" />
            Lock
          </button>
        )}
        <button className="px-2 py-1 text-sm" onClick={onRephrase} disabled={disabled}>
          Rephrase
        </button>
        <button className="px-2 py-1 text-sm" onClick={onCondense} disabled={disabled}>
          Condense
        </button>
      </div>
    </div>
  );
}
