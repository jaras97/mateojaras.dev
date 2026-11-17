"use client";

import { type ColumnDef, tableFeatures, useTable } from "@tanstack/react-table";
import { EllipsisIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { AdminLink } from "@/components/admin/admin-link";
import {
  DeleteConfirm,
  type DeleteConfirmLabels,
} from "@/components/admin/delete-confirm";
import {
  SortableHandle,
  type SortableLabels,
  SortableList,
  SortableMoveButtons,
  SortableRow,
} from "@/components/admin/sortable-list";
import {
  HiddenBadge,
  StatusBadge,
  type StatusLabels,
} from "@/components/admin/status-badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Switch } from "@/components/ui/switch";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  deleteExperience,
  discardExperienceDraft,
  reorderExperiences,
  setExperienceVisible,
} from "../actions";

export type ExperienceRow = {
  id: string;
  company: string;
  roleEs: string;
  roleEn: string;
  type: "employment" | "freelance";
  startDate: string; // YYYY-MM-DD
  endDate: string | null;
  status: "draft" | "published";
  visible: boolean;
  hasPendingDraft: boolean;
};

export type ExperienceTableLabels = {
  columns: {
    company: string;
    role: string;
    type: string;
    dates: string;
    status: string;
    visible: string;
  };
  types: Record<string, string>;
  present: string;
  status: StatusLabels;
  sortable: SortableLabels;
  moreActions: string; // {nombre}
  edit: string;
  discard: string;
  delete: string;
  visibleOn: string;
  visibleOff: string;
  orderSaved: string;
  reorderFailed: string;
  saveFailed: string;
  deleted: string; // {nombre}
  discarded: string;
  discardConfirm: {
    title: string;
    body: string;
    cancel: string;
    confirm: string;
  };
  deleteConfirm: DeleteConfirmLabels;
  empty: { heading: string; body: string; action: string };
};

type RowActions = {
  labels: ExperienceTableLabels;
  setVisible: (row: ExperienceRow, on: boolean) => void;
  askDelete: (row: ExperienceRow) => void;
  askDiscard: (row: ExperienceRow) => void;
};

const ActionsContext = createContext<RowActions | null>(null);

function useActions() {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error("ExperienceTable context missing");
  return actions;
}

const monthFormat = new Intl.DateTimeFormat("es", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function formatMonth(date: string) {
  return monthFormat.format(new Date(`${date}T00:00:00Z`)).replace(".", "");
}

const features = tableFeatures({});

function Header({ k }: { k: keyof ExperienceTableLabels["columns"] }) {
  return <>{useActions().labels.columns[k]}</>;
}

const columns: ColumnDef<typeof features, ExperienceRow>[] = [
  { id: "handle", header: () => null, cell: () => <SortableHandle /> },
  {
    id: "company",
    header: () => <Header k="company" />,
    cell: ({ row }) => (
      <AdminLink
        href={`/admin/experiencia/${row.original.id}`}
        className="line-clamp-2 font-semibold underline-offset-4 hover:underline"
      >
        {row.original.company}
      </AdminLink>
    ),
  },
  {
    id: "role",
    header: () => <Header k="role" />,
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col">
        <span className="line-clamp-2">{row.original.roleEs}</span>
        {row.original.roleEn !== row.original.roleEs ? (
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {row.original.roleEn}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    id: "type",
    header: () => <Header k="type" />,
    cell: ({ row }) => <TypeCell row={row.original} />,
  },
  {
    id: "dates",
    header: () => <Header k="dates" />,
    cell: ({ row }) => <DatesCell row={row.original} />,
  },
  {
    id: "status",
    header: () => <Header k="status" />,
    cell: ({ row }) => <StatusCell row={row.original} />,
  },
  {
    id: "visible",
    header: () => <Header k="visible" />,
    cell: ({ row }) => <VisibleCell row={row.original} />,
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => <MenuCell row={row.original} />,
  },
];

function TypeCell({ row }: { row: ExperienceRow }) {
  const { labels } = useActions();
  return <span className="text-sm">{labels.types[row.type]}</span>;
}

function DatesCell({ row }: { row: ExperienceRow }) {
  const { labels } = useActions();
  return (
    <span className="font-mono text-xs whitespace-nowrap text-muted-foreground">
      {formatMonth(row.startDate)} {"\u2013"}{" "}
      {row.endDate ? formatMonth(row.endDate) : labels.present}
    </span>
  );
}

function StatusCell({ row }: { row: ExperienceRow }) {
  const { labels } = useActions();
  return (
    <span className="flex flex-wrap gap-1">
      <StatusBadge
        status={row.status}
        hasPendingDraft={row.hasPendingDraft}
        labels={labels.status}
      />
      {row.visible ? null : <HiddenBadge label={labels.status.hidden} />}
    </span>
  );
}

function VisibleCell({ row }: { row: ExperienceRow }) {
  const { labels, setVisible } = useActions();
  return (
    <Switch
      aria-label={`${labels.columns.visible}: ${row.company}`}
      checked={row.visible}
      onCheckedChange={(on) => setVisible(row, on)}
    />
  );
}

function MenuCell({ row }: { row: ExperienceRow }) {
  const { labels, askDelete, askDiscard } = useActions();
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={labels.moreActions.replace("{nombre}", row.company)}
          />
        }
      >
        <EllipsisIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/experiencia/${row.id}`)}
        >
          {labels.edit}
        </DropdownMenuItem>
        {row.hasPendingDraft ? (
          <DropdownMenuItem onClick={() => askDiscard(row)}>
            {labels.discard}
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={() => askDelete(row)}>
          {labels.delete}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function ExperienceTable({
  initialRows,
  labels,
}: {
  initialRows: ExperienceRow[];
  labels: ExperienceTableLabels;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [seen, setSeen] = useState(initialRows);
  const [deleting, setDeleting] = useState<ExperienceRow | null>(null);
  const [discarding, setDiscarding] = useState<ExperienceRow | null>(null);

  // Server data changed (refresh after a delete or discard): take it.
  if (seen !== initialRows) {
    setSeen(initialRows);
    setRows(initialRows);
  }

  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (row) => row.id,
  });

  async function reorder(nextIds: string[]) {
    const previous = rows;
    const byId = new Map(rows.map((row) => [row.id, row]));
    setRows(nextIds.flatMap((id) => byId.get(id) ?? []));
    const result = await reorderExperiences(nextIds);
    if (result.ok) {
      toast.success(labels.orderSaved);
    } else {
      setRows(previous);
      toast.error(labels.reorderFailed);
    }
  }

  async function setVisible(row: ExperienceRow, on: boolean) {
    const previous = rows;
    setRows(rows.map((r) => (r.id === row.id ? { ...r, visible: on } : r)));
    const result = await setExperienceVisible(row.id, on);
    if (!result.ok) {
      setRows(previous);
      toast.error(labels.saveFailed);
    } else {
      toast.success(on ? labels.visibleOn : labels.visibleOff);
    }
  }

  async function confirmDelete(row: ExperienceRow) {
    const result = await deleteExperience(row.id, row.company);
    if (result.ok) {
      setDeleting(null);
      toast.success(labels.deleted.replace("{nombre}", row.company));
      router.refresh();
    } else {
      toast.error(labels.saveFailed);
    }
  }

  async function confirmDiscard(row: ExperienceRow) {
    const result = await discardExperienceDraft(row.id);
    setDiscarding(null);
    if (result.ok) {
      toast.success(labels.discarded);
      router.refresh();
    } else {
      toast.error(labels.saveFailed);
    }
  }

  if (rows.length === 0) {
    return (
      <Empty className="border">
        <EmptyHeader>
          <EmptyTitle>{labels.empty.heading}</EmptyTitle>
          <EmptyDescription>{labels.empty.body}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AdminLink
            href="/admin/experiencia/nueva"
            className={buttonVariants({ variant: "default" })}
          >
            {labels.empty.action}
          </AdminLink>
        </EmptyContent>
      </Empty>
    );
  }

  const actions: RowActions = {
    labels,
    setVisible,
    askDelete: setDeleting,
    askDiscard: setDiscarding,
  };

  return (
    <ActionsContext.Provider value={actions}>
      <SortableList
        items={rows.map((row) => ({ id: row.id, name: row.company }))}
        labels={labels.sortable}
        onReorder={reorder}
      >
        {/* A bare table: the shadcn Table wrapper scrolls (overflow-x-auto) and
            dnd-kit's keyboard coordinates stop working inside it. */}
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
                <TableHead className="w-24 max-md:hidden">
                  <span className="sr-only">{labels.sortable.moveUp}</span>
                </TableHead>
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="max-md:block">
            {table.getRowModel().rows.map((row) => (
              <SortableRow
                key={row.id}
                id={row.id}
                className="border-b border-border max-md:flex max-md:flex-wrap max-md:items-center max-md:gap-3 max-md:py-3"
              >
                {row.getAllCells().map((cell) => (
                  <TableCell
                    key={cell.id}
                    className={
                      cell.column.id === "company"
                        ? "max-md:order-first max-md:basis-full max-md:whitespace-normal"
                        : cell.column.id === "type"
                          ? "max-md:hidden"
                          : "max-md:p-0"
                    }
                  >
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
                <TableCell className="max-md:p-0">
                  <SortableMoveButtons />
                </TableCell>
              </SortableRow>
            ))}
          </TableBody>
        </table>
      </SortableList>

      {deleting ? (
        <DeleteConfirm
          key={deleting.id}
          name={deleting.company}
          labels={labels.deleteConfirm}
          open
          onOpenChange={(open) => {
            if (!open) setDeleting(null);
          }}
          onConfirm={() => confirmDelete(deleting)}
        />
      ) : null}

      <Dialog
        open={discarding !== null}
        onOpenChange={(open) => {
          if (!open) setDiscarding(null);
        }}
      >
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>{labels.discardConfirm.title}</DialogTitle>
            <DialogDescription>{labels.discardConfirm.body}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscarding(null)}>
              {labels.discardConfirm.cancel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => discarding && confirmDiscard(discarding)}
            >
              {labels.discardConfirm.confirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ActionsContext.Provider>
  );
}
