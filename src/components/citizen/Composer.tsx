"use client";

import { useRef } from "react";
import { Mic, Square, ImagePlus, Send, Loader2, X } from "lucide-react";
import { t, type Lang } from "@/lib/i18n";

export function Composer({
  lang,
  text,
  onTextChange,
  onSend,
  sending,
  photoDataUrl,
  onPhotoSelected,
  onRemovePhoto,
  audioDataUrl,
  onRemoveAudio,
  isRecording,
  onToggleRecording,
}: {
  lang: Lang;
  text: string;
  onTextChange: (v: string) => void;
  onSend: () => void;
  sending: boolean;
  photoDataUrl: string | null;
  onPhotoSelected: (file: File) => void;
  onRemovePhoto: () => void;
  audioDataUrl: string | null;
  onRemoveAudio: () => void;
  isRecording: boolean;
  onToggleRecording: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className="rounded-2xl border p-3"
      style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--border)" }}
    >
      {(photoDataUrl || audioDataUrl) && (
        <div className="mb-2 flex flex-wrap gap-2">
          {photoDataUrl && (
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photoDataUrl} alt="Preview" className="h-16 w-16 rounded-lg object-cover" />
              <button
                onClick={onRemovePhoto}
                className="absolute -right-1.5 -top-1.5 rounded-full bg-black/70 p-0.5 text-white"
                aria-label={t(lang, "removeAttachment")}
              >
                <X size={12} />
              </button>
            </div>
          )}
          {audioDataUrl && (
            <div className="relative flex items-center gap-2 rounded-lg border px-2 py-1" style={{ borderColor: "var(--border)" }}>
              <audio controls src={audioDataUrl} className="h-8 max-w-[180px]" />
              <button onClick={onRemoveAudio} aria-label={t(lang, "removeAttachment")}>
                <X size={14} style={{ color: "var(--text-muted)" }} />
              </button>
            </div>
          )}
        </div>
      )}

      <div className="flex items-end gap-2">
        <textarea
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          placeholder={t(lang, "textPlaceholder")}
          rows={1}
          className="min-h-[40px] flex-1 resize-none rounded-xl border bg-transparent px-3 py-2 text-sm outline-none"
          style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
        />

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPhotoSelected(file);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          title={t(lang, "attachPhoto")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
          style={{ borderColor: "var(--border)", color: "var(--text-secondary)" }}
        >
          <ImagePlus size={18} />
        </button>

        <button
          type="button"
          onClick={onToggleRecording}
          title={isRecording ? t(lang, "recording") : t(lang, "record")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
          style={
            isRecording
              ? { backgroundColor: "var(--status-critical)", borderColor: "var(--status-critical)", color: "#fff" }
              : { borderColor: "var(--border)", color: "var(--text-secondary)" }
          }
        >
          {isRecording ? <Square size={16} /> : <Mic size={18} />}
        </button>

        <button
          type="button"
          onClick={onSend}
          disabled={sending}
          title={t(lang, "send")}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full disabled:opacity-60"
          style={{ backgroundColor: "var(--brand)", color: "#fff" }}
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={16} />}
        </button>
      </div>
    </div>
  );
}
