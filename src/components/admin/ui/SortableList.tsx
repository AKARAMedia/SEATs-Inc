"use client";

import { useState } from "react";

type Controls = { handle: React.ReactNode; up: () => void; down: () => void; first: boolean; last: boolean };

/**
 * Reorder by dragging the ⋮⋮ handle (mouse) or with the ↑/↓ buttons (keyboard, touch).
 * `onReorder` receives the new id order once the drop (or button move) is done.
 */
export default function SortableList<T extends { id: number }>({
  items,
  onReorder,
  children,
  className = "space-y-2",
}: {
  items: T[];
  onReorder: (ids: number[]) => void;
  children: (item: T, c: Controls) => React.ReactNode;
  className?: string;
}) {
  const [order, setOrder] = useState(items);
  const [dragId, setDragId] = useState<number | null>(null);
  const [last, setLast] = useState(items);
  if (last !== items) {
    setLast(items);
    setOrder(items);
  }

  const commit = (next: T[]) => {
    setOrder(next);
    if (next.map((i) => i.id).join() !== items.map((i) => i.id).join()) onReorder(next.map((i) => i.id));
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order];
    const [it] = next.splice(from, 1);
    next.splice(to, 0, it);
    commit(next);
  };

  return (
    <ul className={className}>
      {order.map((item, i) => (
        <li
          key={item.id}
          onDragOver={(e) => {
            if (dragId === null || dragId === item.id) return;
            e.preventDefault();
            const from = order.findIndex((o) => o.id === dragId);
            const next = [...order];
            const [it] = next.splice(from, 1);
            next.splice(i, 0, it);
            setOrder(next);
          }}
          // Saved in onDragEnd (fires once, after the drop)
          onDrop={(e) => e.preventDefault()}
          className={dragId === item.id ? "opacity-40" : undefined}
        >
          {children(item, {
            handle: (
              <span
                draggable
                onDragStart={(e) => {
                  setDragId(item.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => {
                  if (dragId !== null) commit(order);
                  setDragId(null);
                }}
                title="Drag to reorder"
                aria-hidden
                className="cursor-grab select-none px-1 text-[16px] leading-none text-[#bbb] hover:text-[#666] active:cursor-grabbing"
              >
                ⋮⋮
              </span>
            ),
            up: () => move(i, i - 1),
            down: () => move(i, i + 1),
            first: i === 0,
            last: i === order.length - 1,
          })}
        </li>
      ))}
    </ul>
  );
}

/** The ↑ / ↓ buttons, for use inside a SortableList row. */
export function MoveButtons({ c, label }: { c: Controls; label: string }) {
  const b = "admin-btn-secondary !px-2 !py-1 text-[12px] disabled:opacity-30";
  return (
    <span className="flex gap-1">
      <button type="button" className={b} disabled={c.first} onClick={c.up} aria-label={`Move ${label} up`}>
        ↑
      </button>
      <button type="button" className={b} disabled={c.last} onClick={c.down} aria-label={`Move ${label} down`}>
        ↓
      </button>
    </span>
  );
}
