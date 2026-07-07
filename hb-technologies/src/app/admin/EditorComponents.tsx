"use client";

/**
 * Lightweight inline-editing primitives used only inside the visual admin.
 */

import React, {
  useRef,
  useEffect,
  useState,
  type ReactNode,
  type KeyboardEvent,
  type JSX,
} from "react";
import s from "./editor.module.css";

/* ── EditableText ──────────────────────────────────────────────────
   Renders its children as plain text in edit mode.
   onBlur / Enter commits the change. Click to activate.
*/
interface ETextProps {
  value: string;
  onChange: (v: string) => void;
  tag?: keyof JSX.IntrinsicElements;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
}

export function EditableText({
  value,
  onChange,
  tag: Tag = "span",
  className = "",
  multiline = false,
  placeholder = "Click to edit…",
}: ETextProps) {
  const ref = useRef<HTMLElement>(null);
  const [editing, setEditing] = useState(false);

  /* Keep DOM text in sync — never let React render children inside contentEditable */
  React.useLayoutEffect(() => {
    if (ref.current) ref.current.textContent = value;
  }, [value]);

  const commit = () => {
    setEditing(false);
    const text = ref.current?.textContent ?? "";
    if (text !== value) onChange(text);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (!multiline && e.key === "Enter") { e.preventDefault(); commit(); }
    if (e.key === "Escape") { if (ref.current) ref.current.textContent = value; setEditing(false); }
  };

  const AnyTag = Tag as React.ElementType;
  return (
    <AnyTag
      ref={ref}
      contentEditable={editing}
      suppressContentEditableWarning
      spellCheck={editing}
      className={`${s.editableText} ${editing ? s.editing : ""} ${!value ? s.empty : ""} ${className}`}
      data-placeholder={placeholder}
      onClick={() => { if (!editing) { setEditing(true); setTimeout(() => ref.current?.focus(), 0); } }}
      onBlur={commit}
      onKeyDown={onKeyDown}
    />
  );
}

/* ── EditableImage ─────────────────────────────────────────────────
   Shows the image/video with a hover overlay.
   Supports local file upload (→ base64 data URL) and remote URLs.
*/
interface EImgProps {
  src: string;
  alt?: string;
  onChange: (url: string) => void;
  onTypeChange?: (type: "image" | "video") => void;
  className?: string;
  style?: React.CSSProperties;
  adminPassword?: string;
}

const IMAGE_EXTS = /\.(jpe?g|png|gif|webp|svg|avif|bmp)$/i;
const VIDEO_EXTS = /\.(mp4|webm|mov|ogg|mkv|avi)$/i;

function guessMediaType(url: string): "image" | "video" | null {
  if (IMAGE_EXTS.test(url)) return "image";
  if (VIDEO_EXTS.test(url)) return "video";
  return null;
}

export function EditableImage({ src, alt = "", onChange, onTypeChange, className = "", style, adminPassword = "" }: EImgProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"upload" | "url">("upload");
  const [urlDraft, setUrlDraft] = useState(src);
  const [preview, setPreview] = useState(src);
  const [fileLabel, setFileLabel] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sizeWarn, setSizeWarn] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setUrlDraft(src); setPreview(src); }, [src]);
  useEffect(() => { if (open && tab === "url") urlRef.current?.focus(); }, [open, tab]);

  const apply = () => {
    if (!preview) return;
    onChange(preview);
    const t = guessMediaType(preview);
    if (t && onTypeChange) onTypeChange(t);
    setOpen(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSizeWarn("");
    setFileLabel(file.name);
    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");
    if (!isImage && !isVideo) { setSizeWarn("Unsupported file type."); return; }

    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("folder", isVideo ? "hero" : "media");
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-admin-password": adminPassword },
        body: form,
      });
      const data = await res.json() as { url?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error ?? "Upload failed");
      setPreview(data.url);
      if (onTypeChange) onTypeChange(isVideo ? "video" : "image");
    } catch (err) {
      setSizeWarn(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleUrlChange = (v: string) => {
    setUrlDraft(v);
    setPreview(v);
  };

  const isVideo = preview.startsWith("data:video") || VIDEO_EXTS.test(preview);

  return (
    <div className={`${s.editableImgWrap} ${className}`} style={style}>
      {src && (VIDEO_EXTS.test(src) || src.startsWith("data:video"))
        ? <video src={src} className={s.editableImg} muted playsInline />
        : /* eslint-disable-next-line @next/next/no-img-element */
          <img src={src || "https://placehold.co/1920x1080/111/333?text=No+media"} alt={alt} className={s.editableImg} />
      }
      <div className={s.imgOverlay} onClick={() => setOpen(true)}>
        <span className={s.imgOverlayBtn}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M13 2.5a1.5 1.5 0 010 2.12L5.83 11.8 2 12.5l.7-3.83L10.88 1A1.5 1.5 0 0113 2.5z" stroke="currentColor" strokeWidth="1.3" fill="none"/>
          </svg>
          {src ? "Change media" : "Add media"}
        </span>
      </div>
      {open && (
        <div className={s.imgDialog}>
          {/* Tabs */}
          <div className={s.imgDialogTabs}>
            <button type="button" className={`${s.imgDialogTab} ${tab === "upload" ? s.imgDialogTabActive : ""}`} onClick={() => setTab("upload")}>
              ↑ Upload file
            </button>
            <button type="button" className={`${s.imgDialogTab} ${tab === "url" ? s.imgDialogTabActive : ""}`} onClick={() => { setTab("url"); setTimeout(() => urlRef.current?.focus(), 0); }}>
              🔗 Paste URL
            </button>
          </div>

          {tab === "upload" && (
            <div className={s.imgUploadArea} onClick={() => !uploading && fileRef.current?.click()}>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml,image/avif,image/bmp,video/mp4,video/webm,video/mov,video/ogg,video/*"
                style={{ display: "none" }}
                onChange={handleFile}
              />
              <span className={s.imgUploadIcon}>{uploading ? "⏳" : "📁"}</span>
              <span className={s.imgUploadLabel}>{uploading ? "Uploading…" : (fileLabel || "Click to choose a file")}</span>
              <span className={s.imgUploadHint}>JPEG · PNG · GIF · WebP · SVG · MP4 · WebM · MOV</span>
              {sizeWarn && <span className={s.imgUploadWarn}>{sizeWarn}</span>}
            </div>
          )}

          {tab === "url" && (
            <>
              <p className={s.imgDialogLabel}>Image or video URL</p>
              <input
                ref={urlRef}
                type="url"
                value={urlDraft}
                onChange={(e) => handleUrlChange(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") apply(); if (e.key === "Escape") setOpen(false); }}
                className={s.imgDialogInput}
                placeholder="https://example.com/photo.jpg"
              />
            </>
          )}

          {preview && (
            <div className={s.imgDialogPreviewWrap}>
              {isVideo
                ? <video src={preview} className={s.imgDialogPreview} muted playsInline controls />
                : /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={preview} alt="preview" className={s.imgDialogPreview} onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              }
            </div>
          )}

          <div className={s.imgDialogActions}>
            <button type="button" className={s.applyBtn} onClick={apply} disabled={!preview || uploading}>{uploading ? "Uploading…" : "Apply"}</button>
            <button type="button" className={s.cancelBtn} onClick={() => { setOpen(false); setSizeWarn(""); setFileLabel(""); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── EditableList ──────────────────────────────────────────────────
   For arrays of strings (e.g., stack items, phone numbers).
*/
interface EListProps {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function EditableList({ items, onChange, placeholder = "Add item…", className = "" }: EListProps) {
  const update = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);

  return (
    <ul className={`${s.editableList} ${className}`}>
      {items.map((item, i) => (
        <li key={i} className={s.editableListItem}>
          <EditableText
            value={item}
            onChange={(v) => update(i, v)}
            placeholder={placeholder}
            className={s.editableListText}
          />
          <button type="button" className={s.removeItemBtn} onClick={() => remove(i)} title="Remove">×</button>
        </li>
      ))}
      <li>
        <button type="button" className={s.addItemBtn} onClick={add}>+ Add</button>
      </li>
    </ul>
  );
}

/* ── SectionShell ──────────────────────────────────────────────────
   Wraps a section with a labeled outline and add/remove controls.
*/
interface ShellProps {
  label: string;
  children: ReactNode;
  className?: string;
  onAdd?: () => void;
  addLabel?: string;
  onRemove?: () => void;
}

export function SectionShell({ label, children, className = "", onAdd, addLabel = "Add item", onRemove }: ShellProps) {
  return (
    <div className={`${s.sectionShell} ${className}`}>
      <div className={s.sectionShellLabel}>
        {label}
        {onRemove && (
          <button type="button" className={s.sectionRemoveBtn} onClick={onRemove} title="Remove">×</button>
        )}
      </div>
      {children}
      {onAdd && (
        <button type="button" className={s.sectionAddBtn} onClick={onAdd}>+ {addLabel}</button>
      )}
    </div>
  );
}
