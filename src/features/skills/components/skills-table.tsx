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
  deleteSkill,
  discardSkillDraft,
  reorderSkills,
  setSkillFeatured,
  setSkillVisible,
} from "../actions";
import { SKILL_CATEGORIES } from "../validation";

export type SkillRow = {
  id: string;
  name: string;
  category: (typeof SKILL_CATEGORIES)[number];
  yearsUsed: number | null;
  featured: boolean;
  status: "draft" | "published";
  visible: boolean;
  hasPendingDraft: boolean;
};

export type SkillsTableLabels = {
  columns: {
    name: string;
    category: string;
    years: string;
    featured: string;
    status: string;
    visible: string;
  };
  categories: Record<string, string>;
  status: StatusLabels;
  sortable: SortableLabels;
  moreActions: string; // {nombre}
  edit: string;
  discard: string;
  delete: string;
  visibleOn: string;
  visibleOff: string;
  featuredOn: string;
  featuredOff: string;
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
  labels: SkillsTableLabels;
  setVisible: (row: SkillRow, on: boolean) => void;
  setFeatured: (row: SkillRow, on: boolean) => void;
  askDelete: (row: SkillRow) => void;
  askDiscard: (row: SkillRow) => void;
};

const ActionsContext = createContext<RowActions | null>(null);

function useActions() {
  const actions = useContext(ActionsContext);
  if (!actions) throw new Error("SkillsTable context missing");
  return actions;
}

const features = tableFeatures({});

function Header({ k }: { k: keyof SkillsTableLabels["columns"] }) {
  return <>{useActions().labels.columns[k]}</>;
}

const columns: ColumnDef<typeof features, SkillRow>[] = [
  { id: "handle", header: () => null, cell: () => <SortableHandle /> },
  {
    id: "name",
    header: () => <Header k="name" />,
    cell: ({ row }) => (
      <AdminLink
        href={`/admin/skills/${row.original.id}`}
        className="line-clamp-2 font-semibold underline-offset-4 hover:underline"
      >
        {row.original.name}
      </AdminLink>
    ),
  },
  {
    id: "category",
    header: () => <Header k="category" />,
    cell: ({ row }) => <CategoryCell row={row.original} />,
  },
  {
    id: "years",
    header: () => <Header k="years" />,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {row.original.yearsUsed ?? "–"}
      </span>
    ),
  },
  {
    id: "featured",
    header: () => <Header k="featured" />,
    cell: ({ row }) => <FeaturedCell row={row.original} />,
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

function CategoryCell({ row }: { row: SkillRow }) {
  const { labels } = useActions();
  return <span className="text-sm">{labels.categories[row.category]}</span>;
}

function StatusCell({ row }: { row: SkillRow }) {
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

function FeaturedCell({ row }: { row: SkillRow }) {
  const { labels, setFeatured } = useActions();
  return (
    <Switch
      aria-label={`${labels.columns.featured}: ${row.name}`}
      checked={row.featured}
      onCheckedChange={(on) => setFeatured(row, on)}
    />
  );
}

function VisibleCell({ row }: { row: SkillRow }) {
  const { labels, setVisible } = useActions();
  return (
    <Switch
      aria-label={`${labels.columns.visible}: ${row.name}`}
      checked={row.visible}
      onCheckedChange={(on) => setVisible(row, on)}
    />
  );
}

function MenuCell({ row }: { row: SkillRow }) {
  const { labels, askDelete, askDiscard } = useActions();
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={labels.moreActions.replace("{nombre}", row.name)}
          />
        }
      >
        <EllipsisIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => router.push(`/admin/skills/${row.id}`)}
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

// One category: its own SortableList (so a row can only move inside it) and a
// bare table (dnd-kit keyboard coordinates stop working inside the scrolling
// shadcn Table wrapper).
function CategoryGroup({
  category,
  rows,
  first,
  onReorder,
}: {
  category: string;
  rows: SkillRow[];
  first: boolean;
  onReorder: (category: string, nextIds: string[]) => void;
}) {
  const { labels } = useActions();
  const table = useTable({
    features,
    columns,
    data: rows,
    getRowId: (row) => row.id,
  });
  const headingId = `skills-${category}`;
  return (
    <section aria-labelledby={headingId} className="mb-10">
      <h2
        id={headingId}
        className="mb-2 border-b border-border pb-2 font-mono text-xs tracking-wide text-muted-foreground uppercase"
      >
        {labels.categories[category]}
      </h2>
      <SortableList
        items={rows.map((row) => ({ id: row.id, name: row.name }))}
        labels={labels.sortable}
        onReorder={(ids) => onReorder(category, ids)}
      >
        <table className="w-full caption-bottom text-sm">
          <TableHeader className={first ? "max-md:sr-only" : "sr-only"}>
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
                      cell.column.id === "name"
                        ? "max-md:order-first max-md:basis-full max-md:whitespace-normal"
                        : cell.column.id === "category" ||
                            cell.column.id === "years"
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
    </section>
  );
}

export function SkillsTable({
  initialRows,
  labels,
}: {
  initialRows: SkillRow[];
  labels: SkillsTableLabels;
}) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [seen, setSeen] = useState(initialRows);
  const [deleting, setDeleting] = useState<SkillRow | null>(null);
  const [discarding, setDiscarding] = useState<SkillRow | null>(null);

  // Server data changed (refresh after a delete or discard): take it.
  if (seen !== initialRows) {
    setSeen(initialRows);
    setRows(initialRows);
  }

  async function reorder(category: string, nextIds: string[]) {
    const previous = rows;
    const byId = new Map(rows.map((row) => [row.id, row]));
    const reordered = nextIds.flatMap((id) => byId.get(id) ?? []);
    let cursor = 0;
    setRows(
      rows.map((row) =>
        row.category === category ? (reordered[cursor++] ?? row) : row,
      ),
    );
    const result = await reorderSkills(category, nextIds);
    if (result.ok) {
      toast.success(labels.orderSaved);
    } else {
      setRows(previous);
      toast.error(labels.reorderFailed);
    }
  }

  async function patch(
    row: SkillRow,
    change: Partial<SkillRow>,
    run: () => Promise<{ ok: boolean }>,
    success: string,
  ) {
    const previous = rows;
    setRows(rows.map((r) => (r.id === row.id ? { ...r, ...change } : r)));
    const result = await run();
    if (result.ok) {
      toast.success(success);
    } else {
      setRows(previous);
      toast.error(labels.saveFailed);
    }
  }

  const setVisible = (row: SkillRow, on: boolean) =>
    patch(
      row,
      { visible: on },
      () => setSkillVisible(row.id, on),
      on ? labels.visibleOn : labels.visibleOff,
    );

  const setFeatured = (row: SkillRow, on: boolean) =>
    patch(
      row,
      { featured: on },
      () => setSkillFeatured(row.id, on),
      on ? labels.featuredOn : labels.featuredOff,
    );

  async function confirmDelete(row: SkillRow) {
    const result = await deleteSkill(row.id, row.name);
    if (result.ok) {
      setDeleting(null);
      toast.success(labels.deleted.replace("{nombre}", row.name));
      router.refresh();
    } else {
      toast.error(labels.saveFailed);
    }
  }

  async function confirmDiscard(row: SkillRow) {
    const result = await discardSkillDraft(row.id);
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
            href="/admin/skills/nueva"
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
    setFeatured,
    askDelete: setDeleting,
    askDiscard: setDiscarding,
  };

  const groups = SKILL_CATEGORIES.map((category) => ({
    category,
    rows: rows.filter((row) => row.category === category),
  })).filter((group) => group.rows.length > 0);

  return (
    <ActionsContext.Provider value={actions}>
      {groups.map((group, index) => (
        <CategoryGroup
          key={group.category}
          category={group.category}
          rows={group.rows}
          first={index === 0}
          onReorder={reorder}
        />
      ))}

      {deleting ? (
        <DeleteConfirm
          key={deleting.id}
          name={deleting.name}
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
