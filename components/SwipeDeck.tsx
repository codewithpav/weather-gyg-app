import React, { useEffect, useMemo, useRef, useState } from "react";

type SwipeDirection = "left" | "right";
type SwipeHistoryItem<T> = { item: T; direction: SwipeDirection };

interface SwipeDeckProps<T> {
  items: T[];
  getKey: (item: T, index: number) => string;
  onSwipe: (item: T, direction: SwipeDirection) => void;
  onUndoSwipe?: (item: T, direction: SwipeDirection) => void;
  renderCard: (item: T, index: number) => React.ReactNode;
}

export function SwipeDeck<T>({
  items,
  getKey: _getKey,
  onSwipe,
  onUndoSwipe,
  renderCard,
}: SwipeDeckProps<T>) {
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [animatingOutDirection, setAnimatingOutDirection] = useState<SwipeDirection | null>(null);
  const [history, setHistory] = useState<SwipeHistoryItem<T>[]>([]);
  const startXRef = useRef<number | null>(null);
  const swipeThreshold = 90;
  const throwDistance = 460;

  useEffect(() => {
    setIndex(0);
    setDragX(0);
    setIsDragging(false);
    setAnimatingOutDirection(null);
    setHistory([]);
    startXRef.current = null;
  }, [items]);

  const remaining = useMemo(() => items.slice(index), [items, index]);
  const current = remaining[0];
  const next = remaining[1];

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    startXRef.current = event.clientX;
    setIsDragging(true);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || startXRef.current === null || animatingOutDirection) return;
    setDragX(event.clientX - startXRef.current);
  };

  const finishSwipe = (direction?: SwipeDirection) => {
    if (!direction || !current) {
      setDragX(0);
      setIsDragging(false);
      startXRef.current = null;
      return;
    }

    setAnimatingOutDirection(direction);
    setDragX(direction === "right" ? throwDistance : -throwDistance);
    setIsDragging(false);
    startXRef.current = null;
    window.setTimeout(() => {
      onSwipe(current, direction);
      setHistory((prev) => [...prev, { item: current, direction }]);
      setIndex((prev) => prev + 1);
      setAnimatingOutDirection(null);
      setDragX(0);
    }, 170);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    if (dragX > swipeThreshold) {
      finishSwipe("right");
      return;
    }
    if (dragX < -swipeThreshold) {
      finishSwipe("left");
      return;
    }
    finishSwipe();
  };

  if (!current) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
        You reached the end of this stack.
      </div>
    );
  }

  const topTransform = `translateX(${dragX}px) rotate(${dragX * 0.04}deg)`;
  const likeOpacity = Math.min(1, Math.max(0, dragX / 120));
  const passOpacity = Math.min(1, Math.max(0, -dragX / 120));

  const undoLastSwipe = () => {
    const last = history[history.length - 1];
    if (!last || index === 0) return;
    setHistory((prev) => prev.slice(0, -1));
    setIndex((prev) => Math.max(0, prev - 1));
    onUndoSwipe?.(last.item, last.direction);
  };

  return (
    <div className="relative pb-2">
      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>Swipe deck</span>
        <span>
          {Math.min(index + 1, items.length)} / {items.length}
        </span>
      </div>

      <div className="relative h-[25rem]">
        {next && (
          <div className="absolute inset-x-2 top-2 scale-[0.98] opacity-70">
            {renderCard(next, index + 1)}
          </div>
        )}

        <div
          className="absolute inset-0 touch-pan-y"
          style={{
            transform: topTransform,
            transition: isDragging ? "none" : "transform 170ms ease",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        >
          <div
            className="pointer-events-none absolute left-3 top-3 z-10 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700"
            style={{ opacity: likeOpacity }}
          >
            LIKE
          </div>
          <div
            className="pointer-events-none absolute right-3 top-3 z-10 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700"
            style={{ opacity: passOpacity }}
          >
            PASS
          </div>
          {renderCard(current, index)}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => finishSwipe("left")}
          className="rounded-full border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700"
        >
          Swipe left
        </button>
        <button
          type="button"
          onClick={() => finishSwipe("right")}
          className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700"
        >
          Swipe right
        </button>
        <button
          type="button"
          onClick={undoLastSwipe}
          disabled={history.length === 0}
          className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Undo
        </button>
      </div>
    </div>
  );
}
