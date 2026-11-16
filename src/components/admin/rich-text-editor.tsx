"use client";

import {
  EditorContent,
  type JSONContent,
  useEditor,
  useEditorState,
} from "@tiptap/react";
import {
  Bold,
  Code,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
} from "lucide-react";
import { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { richTextExtensions } from "@/lib/tiptap-extensions";
import { useFormLabels } from "./form-labels";

const HREF = /^(https:\/\/|mailto:)/;

function ToolButton({
  label,
  pressed,
  onClick,
  children,
}: {
  label: string;
  pressed: boolean;
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
            aria-pressed={pressed}
            className={pressed ? "bg-muted" : undefined}
            onClick={onClick}
          />
        }
      >
        {children}
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  label,
  lang,
  missing,
}: {
  value: JSONContent | null;
  onChange: (doc: JSONContent | null) => void;
  label: string;
  lang: string;
  missing?: boolean;
}) {
  const { richText, form } = useFormLabels();
  const editor = useEditor({
    extensions: richTextExtensions,
    content: value ?? "",
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        "aria-label": label,
        lang,
        class:
          "min-h-48 max-w-[68ch] px-3 py-2 text-base outline-none md:text-sm [&_h3]:mt-4 [&_h3]:mb-1 [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:border-l [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground [&_code]:font-mono [&_a]:underline [&_p+p]:mt-2",
      },
    },
    onUpdate: ({ editor: current }) =>
      onChange(current.isEmpty ? null : current.getJSON()),
  });
  const active = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            bold: current.isActive("bold"),
            italic: current.isActive("italic"),
            heading: current.isActive("heading", { level: 3 }),
            bulletList: current.isActive("bulletList"),
            orderedList: current.isActive("orderedList"),
            quote: current.isActive("blockquote"),
            code: current.isActive("code"),
            link: current.isActive("link"),
          }
        : null,
  });
  const [linkOpen, setLinkOpen] = useState(false);
  const [href, setHref] = useState("");
  const [hrefError, setHrefError] = useState(false);

  if (!editor) return <div className="h-48 border border-input" />;
  const chain = () => editor.chain().focus();

  function openLink(open: boolean) {
    setLinkOpen(open);
    if (open && editor) {
      setHref((editor.getAttributes("link").href as string | undefined) ?? "");
      setHrefError(false);
    } else {
      editor?.commands.focus();
    }
  }

  function applyLink() {
    if (!HREF.test(href.trim())) {
      setHrefError(true);
      return;
    }
    chain().extendMarkRange("link").setLink({ href: href.trim() }).run();
    openLink(false);
  }

  return (
    <div
      className={`rounded-[var(--radius)] border bg-transparent focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background ${
        missing ? "border-dashed border-input" : "border-input"
      }`}
    >
      <div
        role="toolbar"
        aria-label={richText.toolbar}
        className="flex flex-wrap gap-1 border-b border-input p-1"
      >
        <ToolButton
          label={richText.bold}
          pressed={active?.bold ?? false}
          onClick={() => chain().toggleBold().run()}
        >
          <Bold />
        </ToolButton>
        <ToolButton
          label={richText.italic}
          pressed={active?.italic ?? false}
          onClick={() => chain().toggleItalic().run()}
        >
          <Italic />
        </ToolButton>
        <ToolButton
          label={richText.heading}
          pressed={active?.heading ?? false}
          onClick={() => chain().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 />
        </ToolButton>
        <ToolButton
          label={richText.bulletList}
          pressed={active?.bulletList ?? false}
          onClick={() => chain().toggleBulletList().run()}
        >
          <List />
        </ToolButton>
        <ToolButton
          label={richText.orderedList}
          pressed={active?.orderedList ?? false}
          onClick={() => chain().toggleOrderedList().run()}
        >
          <ListOrdered />
        </ToolButton>
        <ToolButton
          label={richText.quote}
          pressed={active?.quote ?? false}
          onClick={() => chain().toggleBlockquote().run()}
        >
          <Quote />
        </ToolButton>
        <ToolButton
          label={richText.code}
          pressed={active?.code ?? false}
          onClick={() => chain().toggleCode().run()}
        >
          <Code />
        </ToolButton>
        <Popover open={linkOpen} onOpenChange={openLink}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label={richText.link}
                aria-pressed={active?.link ?? false}
                className={active?.link ? "bg-muted" : undefined}
              />
            }
          >
            <LinkIcon />
          </PopoverTrigger>
          <PopoverContent align="start">
            <label htmlFor="rich-text-link" className="text-sm font-semibold">
              {richText.linkUrl}
            </label>
            <Input
              id="rich-text-link"
              type="url"
              inputMode="url"
              className="font-mono"
              value={href}
              aria-invalid={hrefError ? true : undefined}
              aria-describedby={hrefError ? "rich-text-link-error" : undefined}
              onChange={(event) => {
                setHref(event.target.value);
                setHrefError(false);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyLink();
                }
              }}
            />
            {hrefError ? (
              <p id="rich-text-link-error" className="text-sm text-destructive">
                {form.invalidUrl}
              </p>
            ) : null}
            <div className="flex justify-between gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  chain().extendMarkRange("link").unsetLink().run();
                  openLink(false);
                }}
              >
                {richText.removeLink}
              </Button>
              <Button type="button" size="sm" onClick={applyLink}>
                {richText.apply}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
