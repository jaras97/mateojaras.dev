"use client";

import { type ColumnDef, tableFeatures, useTable } from "@tanstack/react-table";
import { DownloadIcon } from "lucide-react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type CvHistoryRow = {
  id: string;
  locale: "en" | "es";
  version: number;
  generatedAt: string;
  pdfUrl: string;
  isCurrent: boolean;
};

export type CvHistoryLabels = {
  columns: {
    version: string;
    locale: string;
    generated: string;
    status: string;
    download: string;
  };
  current: string;
  download: string;
};

const features = tableFeatures({});

const dateFormat = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: "America/Bogota",
});

function formatGenerated(iso: string) {
  // "16 nov 2026, 10:42": drop the dot ICU adds to short Spanish months.
  return dateFormat.format(new Date(iso)).replace(".", "").replace(" de ", " ");
}

export function CvHistory({
  rows,
  labels,
}: {
  rows: CvHistoryRow[];
  labels: CvHistoryLabels;
}) {
  const columns: ColumnDef<typeof features, CvHistoryRow>[] = [
    {
      id: "version",
      header: labels.columns.version,
      cell: ({ row }) => (
        <span className="font-mono text-sm">v{row.original.version}</span>
      ),
    },
    {
      id: "locale",
      header: labels.columns.locale,
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.locale.toUpperCase()}
        </span>
      ),
    },
    {
      id: "generated",
      header: labels.columns.generated,
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {formatGenerated(row.original.generatedAt)}
        </span>
      ),
    },
    {
      id: "status",
      header: labels.columns.status,
      cell: ({ row }) =>
        row.original.isCurrent ? (
          <span className="inline-flex h-6 items-center rounded-[var(--radius)] border border-border bg-muted px-2 font-mono text-xs">
            {labels.current}
          </span>
        ) : null,
    },
    {
      id: "download",
      header: () => <span className="sr-only">{labels.columns.download}</span>,
      cell: ({ row }) => (
        <a
          href={row.original.pdfUrl}
          download={`mateo-jaramillo-cv-${row.original.locale}-v${row.original.version}.pdf`}
          className="inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"
        >
          <DownloadIcon aria-hidden className="size-4" />
          {labels.download}
          <span className="sr-only">
            {` v${row.original.version} ${row.original.locale.toUpperCase()}`}
          </span>
        </a>
      ),
    },
  ];

  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (row) => row.id,
  });

  return (
    <table className="w-full caption-bottom text-sm">
      <TableHeader>
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
      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id} className="border-b border-border">
            {row.getAllCells().map((cell) => (
              <TableCell key={cell.id}>
                <table.FlexRender cell={cell} />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </table>
  );
}
