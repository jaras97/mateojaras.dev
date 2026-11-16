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
import { draftPreviewHref } from "@/lib/draft-preview";
import { discardProjectDraft } from "../actions";
import {
  deleteProject,
  reorderProjects,
  setProjectFeatured,
  setProjectVisible,
} from "../list-actions";

export type ProjectRow = {
  id: string;
  slug: string;
  titleEs: string;
  titleEn: string;
  status: "draft" | "published";
  visible: boolean;
  featured: boolean;
  updatedAt: string; // ISO
  hasPendingDraft: boolean;
};

export type ProjectsTableLabels = {
  columns: {
    title: string;
    slug: string;
    status: string;
    visible: string;
    featured: string;
    updated: string;
    actions: string;
  };
  status: StatusLabels;
  sortable: SortableLabels;
  moreActions: string; // {nombre}
  edit: string;
  preview: string;
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
  labels: ProjectsTableLabels;
  setFlag: (row: ProjectRow, key: "visible" | "featured", on: boolean) => void;
  askDelete: (row: ProjectRow) => void;
  askDiscard: (row: ProjectRow) => void;
};

const ActionsContext = createContext<RowActions | null>(null);

function useActions() {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error("ProjectsTable context missing");
  return actions;
}

const dateFormat = new Intl.DateTimeFormat("es", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "America/Bogota",
});

const features = tableFeatures({});

function Header({ k }: { k: keyof ProjectsTableLabels["columns"] }) {
  return <>{useActions().labels.columns[k]}</>;
}

const columns: ColumnDef<typeof features, ProjectRow>[] = [
  { id: "handle", header: () => null, cell: () => <SortableHandle /> },
  {
    id: "title",
    header: () => <Header k="title" />,
    cell: ({ row }) => (
      <div className="flex min-w-0 flex-col">
        <AdminLink
          href={`/admin/proyectos/${row.original.id}`}
          className="line-clamp-2 font-semibold underline-offset-4 hover:underline"
        >
          {row.original.titleEs}
        </AdminLink>
        {row.original.titleEn !== row.original.titleEs ? (
          <span className="line-clamp-2 text-xs text-muted-foreground">
            {row.original.titleEn}
          </span>
        ) : null}
      </div>
    ),
  },
  {
    id: "slug",
    header: () => <Header k="slug" />,
    cell: ({ row }) => (
      <span
        className="block max-w-40 truncate font-mono text-xs text-muted-foreground"
        title={row.original.slug}
      >
        {row.original.slug}
      </span>
    ),
  },
  {
    id: "status",
    header: () => <Header k="status" />,
    cell: ({ row }) => <StatusCell row={row.original} />,
  },
  {
    id: "visible",
    header: () => <Header k="visible" />,
    cell: ({ row }) => <FlagCell row={row.original} flag="visible" />,
  },
  {
    id: "featured",
    header: () => <Header k="featured" />,
    cell: ({ row }) => <FlagCell row={row.original} flag="featured" />,
  },
  {
    id: "updated",
    header: () => <Header k="updated" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {dateFormat.format(new Date(row.original.updatedAt))}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => null,
    cell: ({ row }) => <MenuCell row={row.original} />,
  },
];

function StatusCell({ row }: { row: ProjectRow }) {
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

function FlagCell({
  row,
  flag,
}: {
  row: ProjectRow;
  flag: "visible" | "featured";
}) {
  const { labels, setFlag } = useActions();
  return (
    <Switch
      aria-label={`${labels.columns[flag]}: ${row.titleEs}`}
      checked={row[flag]}
      onCheckedChange={(on) => setFlag(row, flag, on)}
    />
  );
}

function MenuCell({ row }: { row: ProjectRow }) {
  const { labels, askDelete, askDiscard } = useActions();
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={labels.moreActions.replace("{nombre}", row.titleEs)}
          />
        }
      >
        <EllipsisIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/proyectos/${row.id}`)}
        >
          {labels.edit}
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <a
              href={draftPreviewHref({ kind: "project", id: row.id })}
              target="_blank"
              rel="noopener"
            >
              {labels.preview}
            </a>
          }
        />
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

export function ProjectsTable({
  initialRows,
  labels,
}: {
  initialRows: ProjectRow[];
  labels: ProjectsTableLabels;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [seen, setSeen] = useState(initialRows);
  const [deleting, setDeleting] = useState<ProjectRow | null>(null);
  const [discarding, setDiscarding] = useState<ProjectRow | null>(null);

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
    const result = await reorderProjects(nextIds);
    if (result.ok) {
      toast.success(labels.orderSaved);
    } else {
      setRows(previous);
      toast.error(labels.reorderFailed);
    }
  }

  async function setFlag(
    row: ProjectRow,
    key: "visible" | "featured",
    on: boolean,
  ) {
    const previous = rows;
    setRows(rows.map((r) => (r.id === row.id ? { ...r, [key]: on } : r)));
    const result =
      key === "visible"
        ? await setProjectVisible(row.id, on)
        : await setProjectFeatured(row.id, on);
    if (!result.ok) {
      setRows(previous);
      toast.error(labels.saveFailed);
    } else if (key === "visible") {
      toast.success(on ? labels.visibleOn : labels.visibleOff);
    }
  }

  async function confirmDelete(row: ProjectRow) {
    const result = await deleteProject(row.id, row.titleEs);
    if (result.ok) {
      setDeleting(null);
      toast.success(labels.deleted.replace("{nombre}", row.titleEs));
      router.refresh();
    } else {
      toast.error(labels.saveFailed);
    }
  }

  async function confirmDiscard(row: ProjectRow) {
    const result = await discardProjectDraft(row.id);
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
            href="/admin/proyectos/nuevo"
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
    setFlag,
    askDelete: setDeleting,
    askDiscard: setDiscarding,
  };

  return (
    <ActionsContext.Provider value={actions}>
      <SortableList
        items={rows.map((row) => ({ id: row.id, name: row.titleEs }))}
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
                      cell.column.id === "title"
                        ? "max-md:order-first max-md:basis-full max-md:whitespace-normal"
                        : cell.column.id === "slug"
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
          name={deleting.titleEs}
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
