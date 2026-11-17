"use client";

import { upload } from "@vercel/blob/client";
import { cn } from "cn";
import { useEffect, useId, useRef, useState } from "react";
import { BilingualField } from "@/components/admin/bilingual-field";
import { EnvMissingNotice } from "@/components/admin/env-missing-notice";
import { useFormLabels } from "@/components/admin/form-labels";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MAX_UPLOAD_BYTES,
  safeUploadName,
  UPLOAD_CONTENT_TYPES,
} from "@/lib/blob-upload";
import { fill } from "@/lib/messages";

export type MediaItem = {
  url: string;
  altEn: string;
  altEs: string;
  type: "image" | "video";
};

type Pending = { key: string; preview: string; percent: number };

type Props = {
  projectId: string;
  media: MediaItem[];
  coverImage: string;
  onChange: (media: MediaItem[], coverImage: string) => void;
  uploadsEnabled: boolean;
};

function formatMb(bytes: number) {
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

async function readSize(file: File) {
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
}

export function ImageUploader({
  projectId,
  media,
  coverImage,
  onChange,
  uploadsEnabled,
}: Props) {
  const { images, common, form, projects } = useFormLabels();
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<Pending[]>([]);
  const [warnings, setWarnings] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  // Uploads finish out of render order; the latest props are read through refs.
  const state = useRef({ media, coverImage, onChange });
  useEffect(() => {
    state.current = { media, coverImage, onChange };
  });
  const previews = useRef<string[]>([]);
  useEffect(
    () => () => {
      for (const url of previews.current) URL.revokeObjectURL(url);
    },
    [],
  );

  if (!uploadsEnabled) {
    return <EnvMissingNotice message={images.tokenMissing} />;
  }

  async function handleFile(file: File) {
    setError(null);
    if (!UPLOAD_CONTENT_TYPES.includes(file.type)) {
      setError(images.wrongType);
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setError(fill(images.tooBig, { tamaño: formatMb(file.size) }));
      return;
    }
    const size = await readSize(file);
    const preview = URL.createObjectURL(file);
    previews.current.push(preview);
    const key = `${file.name}-${Date.now()}`;
    setPending((list) => [...list, { key, preview, percent: 0 }]);
    try {
      const blob = await upload(
        `projects/${projectId}/${safeUploadName(file.name)}`,
        file,
        {
          access: "public",
          handleUploadUrl: "/api/blob/upload",
          onUploadProgress: ({ percentage }) =>
            setPending((list) =>
              list.map((item) =>
                item.key === key
                  ? { ...item, percent: Math.round(percentage) }
                  : item,
              ),
            ),
        },
      );
      const current = state.current;
      current.onChange(
        [
          ...current.media,
          { url: blob.url, altEn: "", altEs: "", type: "image" },
        ],
        current.coverImage || blob.url,
      );
      if (size && Math.abs(size.width / size.height - 1.6) / 1.6 > 0.01) {
        setWarnings((prev) => ({
          ...prev,
          [blob.url]: fill(images.ratioWarning, {
            ancho: String(size.width),
            alto: String(size.height),
          }),
        }));
      }
    } catch {
      setError(images.failed);
    } finally {
      setPending((list) => list.filter((item) => item.key !== key));
    }
  }

  function pick(files: FileList | null) {
    if (!files) return;
    for (const file of Array.from(files)) void handleFile(file);
    if (inputRef.current) inputRef.current.value = "";
  }

  function move(index: number, delta: number) {
    const next = [...media];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item);
    onChange(next, coverImage);
  }

  function remove(index: number) {
    const removed = media[index];
    const next = media.filter((_, i) => i !== index);
    const cover =
      removed.url === coverImage
        ? ((next[index] ?? next[index - 1])?.url ?? "")
        : coverImage;
    onChange(next, cover);
  }

  const dropzone = (
    <label
      htmlFor={inputId}
      onDragOver={(event) => {
        event.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        pick(event.dataTransfer.files);
      }}
      className={cn(
        "flex aspect-[16/10] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted px-6 text-center focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
        dragging && "border-primary",
        media.length > 0 && "aspect-auto py-6",
      )}
    >
      <span className="text-sm font-semibold">{images.dropzone}</span>
      <span className="font-mono text-xs text-muted-foreground">
        {images.formats}
      </span>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept={UPLOAD_CONTENT_TYPES.join(",")}
        className="sr-only"
        onChange={(event) => pick(event.target.files)}
      />
    </label>
  );

  return (
    <div className="flex flex-col gap-6">
      {media.length > 0 ? (
        <ul className="flex flex-col gap-8">
          {media.map((item, index) => {
            const isCover = item.url === coverImage;
            return (
              <li key={item.url} className="flex flex-col gap-4">
                <div className="relative aspect-[16/10] w-full max-w-xl overflow-hidden rounded-lg border border-border bg-muted">
                  {/* biome-ignore lint/performance/noImgElement: admin preview of a remote Blob URL */}
                  <img
                    src={item.url}
                    alt={item.altEs || images.previewAlt}
                    width={1600}
                    height={1000}
                    className="size-full object-cover"
                  />
                  {isCover ? (
                    <span className="absolute top-2 left-2 rounded-sm bg-background px-2 py-0.5 font-mono text-xs">
                      {projects.fields.cover.label}
                    </span>
                  ) : null}
                </div>
                {warnings[item.url] ? (
                  <p className="text-sm text-muted-foreground">
                    {warnings[item.url]}
                  </p>
                ) : null}
                <BilingualField
                  esName={`media.${index}.altEs`}
                  enName={`media.${index}.altEn`}
                  label={images.alt}
                  accessibleLabel={`${images.alt} ${index + 1}`}
                  helper={form.altHelper}
                />
                <div className="flex flex-wrap gap-2">
                  {isCover ? null : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onChange(media, item.url)}
                    >
                      {images.useAsCover}
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    {common.moveUp}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={index === media.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    {common.moveDown}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    {common.remove}
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}
      {pending.map((item) => (
        <div
          key={item.key}
          className="relative aspect-[16/10] w-full max-w-xl overflow-hidden rounded-lg border border-border"
        >
          {/* biome-ignore lint/performance/noImgElement: local object URL preview */}
          <img
            src={item.preview}
            alt={images.previewAlt}
            className="size-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-end gap-2 bg-background/50 p-4">
            <Progress
              value={item.percent}
              aria-label={images.uploading.replace(
                "{percent}",
                String(item.percent),
              )}
            />
            <span className="font-mono text-xs">
              {fill(images.uploading, { percent: String(item.percent) })}
            </span>
          </div>
        </div>
      ))}
      <div className="max-w-xl">{dropzone}</div>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
