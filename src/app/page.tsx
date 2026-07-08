"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Composer } from "@/components/citizen/Composer";
import { ChatBubblePair } from "@/components/citizen/ChatBubble";
import { RecentFeed } from "@/components/citizen/RecentFeed";
import { LANGUAGES, t, wardLabel, type Lang } from "@/lib/i18n";
import { fileToResizedDataUrl, blobToDataUrl, splitDataUrl, pickAudioMimeType } from "@/lib/client-media";
import type { SubmissionDTO, WardDTO } from "@/lib/types";

export default function CitizenPortalPage() {
  const [lang, setLang] = useState<Lang>("en");
  const [wards, setWards] = useState<WardDTO[]>([]);
  const [wardId, setWardId] = useState<string>("");
  const [citizenName, setCitizenName] = useState("");

  const [text, setText] = useState("");
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [audioDataUrl, setAudioDataUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<SubmissionDTO[]>([]);
  const [recent, setRecent] = useState<SubmissionDTO[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/wards")
      .then((r) => r.json())
      .then((d: { wards: WardDTO[] }) => {
        setWards(d.wards);
        if (d.wards[0]) setWardId(d.wards[0].id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!wardId) return;
    fetch(`/api/submissions?wardId=${wardId}&limit=6`)
      .then((r) => r.json())
      .then((d: { submissions: SubmissionDTO[] }) => setRecent(d.submissions))
      .catch(() => {});
  }, [wardId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [history]);

  async function handlePhotoSelected(file: File) {
    try {
      const dataUrl = await fileToResizedDataUrl(file);
      setPhotoDataUrl(dataUrl);
    } catch {
      setError(t(lang, "errorGeneric"));
    }
  }

  async function toggleRecording() {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = pickAudioMimeType();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: mimeType || "audio/webm" });
        stream.getTracks().forEach((tr) => tr.stop());
        const dataUrl = await blobToDataUrl(blob);
        setAudioDataUrl(dataUrl);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setIsRecording(true);
    } catch {
      setError(t(lang, "errorGeneric"));
    }
  }

  async function handleSend() {
    setError(null);
    if (!wardId) {
      setError(t(lang, "errorNeedWard"));
      return;
    }
    if (!text.trim() && !photoDataUrl && !audioDataUrl) {
      setError(t(lang, "errorNeedContent"));
      return;
    }

    setSending(true);
    try {
      const image = photoDataUrl ? splitDataUrl(photoDataUrl) : null;
      const audio = audioDataUrl ? splitDataUrl(audioDataUrl) : null;
      const channel = audio ? "voice" : image ? "photo" : "text";

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim() || undefined,
          imageBase64: image?.base64,
          imageMimeType: image?.mimeType,
          audioBase64: audio?.base64,
          audioMimeType: audio?.mimeType,
          wardId,
          citizenName: citizenName.trim() || undefined,
          channel,
        }),
        signal: AbortSignal.timeout(20_000),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t(lang, "errorGeneric"));

      setHistory((h) => [...h, data.submission]);
      setRecent((r) => [data.submission, ...r].slice(0, 6));
      setText("");
      setPhotoDataUrl(null);
      setAudioDataUrl(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : t(lang, "errorGeneric"));
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header
        className="sticky top-0 z-10 flex items-center justify-between border-b px-4 py-3 backdrop-blur"
        style={{ borderColor: "var(--border)", backgroundColor: "color-mix(in srgb, var(--surface-2) 85%, transparent)" }}
      >
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
            {t(lang, "appName")}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {t(lang, "tagline")}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex overflow-hidden rounded-full border" style={{ borderColor: "var(--border)" }}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className="px-3 py-1.5 text-xs font-medium"
                style={
                  lang === l.code
                    ? { backgroundColor: "var(--brand)", color: "#fff" }
                    : { color: "var(--text-secondary)" }
                }
              >
                {l.label}
              </button>
            ))}
          </div>
          <Link href="/dashboard" className="text-xs font-medium" style={{ color: "var(--brand)" }}>
            {t(lang, "viewDashboard")}
          </Link>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 gap-6 px-4 py-6">
        <div className="flex flex-1 flex-col gap-4">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {t(lang, "heroTitle")}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
              {t(lang, "heroSubtitle")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <label className="flex flex-1 min-w-[160px] flex-col gap-1">
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {t(lang, "selectWard")}
              </span>
              <select
                value={wardId}
                onChange={(e) => setWardId(e.target.value)}
                className="rounded-xl border bg-transparent px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              >
                {wards.length === 0 && <option>{t(lang, "selectWardPlaceholder")}</option>}
                {wards.map((w) => (
                  <option key={w.id} value={w.id}>
                    {wardLabel(w, lang)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-1 min-w-[160px] flex-col gap-1">
              <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                {t(lang, "yourName")}
              </span>
              <input
                value={citizenName}
                onChange={(e) => setCitizenName(e.target.value)}
                placeholder={t(lang, "yourNamePlaceholder")}
                className="rounded-xl border bg-transparent px-3 py-2 text-sm"
                style={{ borderColor: "var(--border)", color: "var(--text-primary)" }}
              />
            </label>
          </div>

          <div
            ref={scrollRef}
            className="flex max-h-[50vh] min-h-[220px] flex-col gap-4 overflow-y-auto rounded-2xl border p-4"
            style={{ borderColor: "var(--border)", backgroundColor: "var(--surface-2)" }}
          >
            <div className="flex justify-start">
              <div
                className="max-w-[85%] rounded-2xl rounded-tl-sm border px-4 py-3 text-sm"
                style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--border)" }}
              >
                <div className="mb-1 flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--brand)" }}>
                  <Sparkles size={13} /> JanVaani AI
                </div>
                {t(lang, "assistantGreeting")}
              </div>
            </div>
            {history.map((s) => (
              <ChatBubblePair key={s.id} submission={s} lang={lang} />
            ))}
          </div>

          {error && (
            <p className="text-sm font-medium" style={{ color: "var(--status-critical)" }}>
              {error}
            </p>
          )}

          <Composer
            lang={lang}
            text={text}
            onTextChange={setText}
            onSend={handleSend}
            sending={sending}
            photoDataUrl={photoDataUrl}
            onPhotoSelected={handlePhotoSelected}
            onRemovePhoto={() => setPhotoDataUrl(null)}
            audioDataUrl={audioDataUrl}
            onRemoveAudio={() => setAudioDataUrl(null)}
            isRecording={isRecording}
            onToggleRecording={toggleRecording}
          />
        </div>

        <aside className="hidden w-72 shrink-0 lg:block">
          <RecentFeed items={recent} lang={lang} />
        </aside>
      </main>
    </div>
  );
}
