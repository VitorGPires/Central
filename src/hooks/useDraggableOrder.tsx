import React, { useEffect, useState } from 'react';

export function reorderItems<T>(list: T[], fromId: T, toId: T): T[] {
  if (fromId === toId) return list;
  const next = [...list];
  const fromIdx = next.indexOf(fromId);
  const toIdx = next.indexOf(toId);
  if (fromIdx === -1 || toIdx === -1) return list;
  const [moved] = next.splice(fromIdx, 1);
  next.splice(toIdx, 0, moved);
  return next;
}

export function useDraggableOrder<T extends string>(
  storageKey: string,
  defaultOrder: readonly T[]
) {
  const fullKey = `minhacentral_order_${storageKey}`;

  const [order, setOrder] = useState<T[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(fullKey) || 'null');
      if (
        Array.isArray(saved) &&
        saved.length === defaultOrder.length &&
        defaultOrder.every((id) => saved.includes(id))
      ) {
        return saved as T[];
      }
    } catch {
      // ignore
    }
    return [...defaultOrder];
  });

  const [draggingId, setDraggingId] = useState<T | null>(null);
  const [overId, setOverId] = useState<T | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(fullKey, JSON.stringify(order));
    } catch {
      // ignore
    }
  }, [fullKey, order]);

  const isCustom = order.join(',') !== defaultOrder.join(',');

  const resetOrder = () => setOrder([...defaultOrder]);

  const getDragProps = (id: T) => ({
    draggable: true,
    onDragStart: (e: React.DragEvent) => {
      setDraggingId(id);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', id);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      if (draggingId && draggingId !== id) setOverId(id);
    },
    onDragLeave: () => {
      if (overId === id) setOverId(null);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      if (draggingId && draggingId !== id) {
        setOrder((prev) => reorderItems(prev, draggingId, id));
      }
      setDraggingId(null);
      setOverId(null);
    },
    onDragEnd: () => {
      setDraggingId(null);
      setOverId(null);
    },
  });

  const getDragClasses = (id: T, darkSurface = false) => {
    const dragging = draggingId === id ? 'card-dragging' : '';
    const over =
      overId === id && draggingId !== id
        ? darkSurface
          ? 'card-drop-target'
          : 'card-drop-target-light'
        : '';
    return `group/drag ${dragging} ${over}`.trim();
  };

  return { order, isCustom, resetOrder, getDragProps, getDragClasses };
}

export const DragGrip: React.FC<{ light?: boolean }> = ({ light }) => (
  <span
    className="inline-grid grid-cols-2 gap-[2.5px] opacity-35 group-hover/drag:opacity-85 transition-opacity cursor-grab active:cursor-grabbing p-1 -m-1 shrink-0"
    title="Arraste para reorganizar"
    aria-hidden="true"
  >
    {[0, 1, 2, 3, 4, 5].map((i) => (
      <span
        key={i}
        className="w-[3px] h-[3px] rounded-full"
        style={{ backgroundColor: light ? '#ffffff' : 'var(--text-muted)' }}
      />
    ))}
  </span>
);
