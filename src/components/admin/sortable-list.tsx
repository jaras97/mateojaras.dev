"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "cn";
import { ChevronDownIcon, ChevronUpIcon, GripVerticalIcon } from "lucide-react";
import { createContext, type ReactNode, useContext, useId } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type SortableItem = { id: string; name: string };

// Strings keep their {nombre}, {n} and {total} placeholders.
export type SortableLabels = {
  roleDescription: string;
  instructions: string;
  pickedUp: string;
  over: string;
  dropped: string;
  cancelled: string;
  moveItem: string;
  moveUpItem: string;
  moveDownItem: string;
  moveUp: string;
  moveDown: string;
};

type ListContext = {
  items: SortableItem[];
  labels: SortableLabels;
  move: (id: string, delta: -1 | 1) => void;
};

const Context = createContext<ListContext | null>(null);

function useList() {
  const context = useContext(Context);
  if (!context) throw new Error("Sortable parts need a SortableList");
  return context;
}

function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export function SortableList({
  items,
  labels,
  onReorder,
  children,
}: {
  items: SortableItem[];
  labels: SortableLabels;
  // Receives the full next id order; the caller persists it.
  onReorder: (nextIds: string[]) => void;
  children: ReactNode;
}) {
  const id = useId();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const ids = items.map((item) => item.id);
  const total = items.length;
  const nameOf = (key: string | number) =>
    items.find((item) => item.id === key)?.name ?? "";
  const positionOf = (key: string | number) =>
    items.findIndex((item) => item.id === key) + 1;

  function commit(from: string, to: string) {
    if (from === to) return;
    const oldIndex = ids.indexOf(from);
    const newIndex = ids.indexOf(to);
    if (oldIndex < 0 || newIndex < 0) return;
    onReorder(arrayMove(ids, oldIndex, newIndex));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (over) commit(String(active.id), String(over.id));
  }

  const context: ListContext = {
    items,
    labels,
    move: (key, delta) => {
      const index = ids.indexOf(key);
      const target = ids[index + delta];
      if (target) commit(key, target);
    },
  };

  return (
    <Context.Provider value={context}>
      <DndContext
        id={id}
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        accessibility={{
          screenReaderInstructions: { draggable: labels.instructions },
          announcements: {
            onDragStart: ({ active }) =>
              fill(labels.pickedUp, { nombre: nameOf(active.id) }),
            onDragOver: ({ active, over }) =>
              fill(labels.over, {
                nombre: nameOf(active.id),
                n: positionOf(over?.id ?? active.id),
                total,
              }),
            onDragEnd: ({ active, over }) =>
              fill(labels.dropped, {
                nombre: nameOf(active.id),
                n: positionOf(over?.id ?? active.id),
                total,
              }),
            onDragCancel: ({ active }) =>
              fill(labels.cancelled, {
                nombre: nameOf(active.id),
                n: positionOf(active.id),
              }),
          },
        }}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {children}
        </SortableContext>
      </DndContext>
    </Context.Provider>
  );
}

type RowControls = {
  handle: ReactNode;
  moveButtons: ReactNode;
};

const RowContext = createContext<RowControls | null>(null);

export function useSortableRow(): RowControls {
  const controls = useContext(RowContext);
  if (!controls) throw new Error("useSortableRow needs a SortableRow");
  return controls;
}

// One sortable row. `as` picks the element so it fits a table or a list.
export function SortableRow({
  id,
  as: Component = "tr",
  className,
  children,
}: {
  id: string;
  as?: "tr" | "li";
  className?: string;
  children: ReactNode;
}) {
  const { items, labels, move } = useList();
  const sortable = useSortable({ id });
  const index = items.findIndex((item) => item.id === id);
  const name = items[index]?.name ?? "";
  const alone = items.length < 2;

  const handle = (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            ref={sortable.setActivatorNodeRef}
            {...sortable.attributes}
            {...sortable.listeners}
            aria-roledescription={labels.roleDescription}
            aria-label={fill(labels.moveItem, { nombre: name })}
            disabled={alone}
            className="inline-flex size-8 cursor-grab touch-none items-center justify-center rounded-[var(--radius)] text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
          />
        }
      >
        <GripVerticalIcon aria-hidden="true" className="size-4" />
      </TooltipTrigger>
      <TooltipContent>{fill(labels.moveItem, { nombre: name })}</TooltipContent>
    </Tooltip>
  );

  const moveButtons = (
    <span className="inline-flex items-center gap-1">
      <MoveButton
        label={fill(labels.moveUpItem, { nombre: name })}
        tooltip={labels.moveUp}
        disabled={alone || index === 0}
        onClick={() => move(id, -1)}
      >
        <ChevronUpIcon aria-hidden="true" />
      </MoveButton>
      <MoveButton
        label={fill(labels.moveDownItem, { nombre: name })}
        tooltip={labels.moveDown}
        disabled={alone || index === items.length - 1}
        onClick={() => move(id, 1)}
      >
        <ChevronDownIcon aria-hidden="true" />
      </MoveButton>
    </span>
  );

  return (
    <RowContext.Provider value={{ handle, moveButtons }}>
      <Component
        ref={sortable.setNodeRef as never}
        style={{
          transform: CSS.Translate.toString(sortable.transform),
          transition: sortable.transition,
        }}
        className={cn(
          "bg-background motion-reduce:transition-none",
          sortable.isDragging &&
            "relative z-10 outline outline-1 outline-muted-foreground",
          className,
        )}
      >
        {children}
      </Component>
    </RowContext.Provider>
  );
}

function MoveButton({
  label,
  tooltip,
  disabled,
  onClick,
  children,
}: {
  label: string;
  tooltip: string;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label={label}
            disabled={disabled}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  );
}

export function SortableHandle() {
  return <>{useSortableRow().handle}</>;
}

export function SortableMoveButtons() {
  return <>{useSortableRow().moveButtons}</>;
}
