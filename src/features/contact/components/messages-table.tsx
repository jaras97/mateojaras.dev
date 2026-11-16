"use client";

import { type ColumnDef, tableFeatures, useTable } from "@tanstack/react-table";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { markMessageRead } from "../actions";
import {
  MessageReader,
  type MessageReaderLabels,
  type MessageRow,
} from "./message-reader";

export type MessagesTableLabels = {
  columns: {
    name: string;
    email: string;
    message: string;
    locale: string;
    received: string;
  };
  new: string;
  empty: { heading: string; body: string };
  reader: MessageReaderLabels;
};

type Ctx = { labels: MessagesTableLabels; open: (row: MessageRow) => void };
const TableContext = createContext<Ctx | null>(null);

function useCtx() {
  const ctx = useContext(TableContext);
  if (!ctx) throw new Error("MessagesTable context missing");
  return ctx;
}

const dateFormat = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Bogota",
});

const features = tableFeatures({});

function Header({ k }: { k: keyof MessagesTableLabels["columns"] }) {
  return <>{useCtx().labels.columns[k]}</>;
}

function NameCell({ row }: { row: MessageRow }) {
  const { labels, open } = useCtx();
  const unread = row.readAt === null;
  return (
    <span className="flex min-w-0 flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          open(row);
        }}
        className={`min-w-0 break-words text-left underline-offset-4 hover:underline ${unread ? "font-semibold" : ""}`}
      >
        {row.name}
      </button>
      {unread ? (
        <span className="font-mono text-xs text-primary">{labels.new}</span>
      ) : null}
    </span>
  );
}

const columns: ColumnDef<typeof features, MessageRow>[] = [
  {
    id: "name",
    header: () => <Header k="name" />,
    cell: ({ row }) => <NameCell row={row.original} />,
  },
  {
    id: "email",
    header: () => <Header k="email" />,
    cell: ({ row }) => (
      <span className="block max-w-56 truncate font-mono text-xs">
        {row.original.email}
      </span>
    ),
  },
  {
    id: "message",
    header: () => <Header k="message" />,
    cell: ({ row }) => {
      const first = row.original.message.split(/\r\n|\r|\n/, 1)[0] ?? "";
      return (
        <span
          className="block max-w-xs truncate text-muted-foreground"
          title={first}
        >
          {first}
        </span>
      );
    },
  },
  {
    id: "locale",
    header: () => <Header k="locale" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs">
        {row.original.locale.toUpperCase()}
      </span>
    ),
  },
  {
    id: "received",
    header: () => <Header k="received" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {dateFormat.format(new Date(row.original.createdAt))}
      </span>
    ),
  },
];

export function MessagesTable({
  rows,
  labels,
}: {
  rows: MessageRow[];
  labels: MessagesTableLabels;
}) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (row) => row.id,
  });

  const selected = rows.find((row) => row.id === selectedId) ?? null;

  async function open(row: MessageRow) {
    setSelectedId(row.id);
    if (row.readAt === null) {
      const result = await markMessageRead(row.id);
      if (result.ok) router.refresh();
      else toast.error(labels.reader.updateFailed);
    }
  }

  if (rows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>{labels.empty.heading}</EmptyTitle>
          <EmptyDescription>{labels.empty.body}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <TableContext.Provider value={{ labels, open }}>
      <table className="w-full caption-bottom text-sm">
        <TableHeader className="max-md:sr-only">
          {table.getHeaderGroups().map((group) => (
            <TableRow key={group.id}>
              {group.headers.map((header) => (
                <TableHead key={header.id} className="text-xs">
                  {header.isPlaceholder ? null : (
                    <table.FlexRender header={header} />
                  )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody className="max-md:block">
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="cursor-pointer border-b border-border hover:bg-muted/50 max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-x-3 max-md:py-3"
              onClick={() => open(row.original)}
            >
              {row.getAllCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className={
                    cell.column.id === "name"
                      ? "max-md:basis-full"
                      : cell.column.id === "message"
                        ? "max-md:order-last max-md:basis-full"
                        : "max-md:p-0"
                  }
                >
                  <table.FlexRender cell={cell} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </table>
      <MessageReader
        message={selected}
        labels={labels.reader}
        onClose={() => setSelectedId(null)}
      />
    </TableContext.Provider>
  );
}
