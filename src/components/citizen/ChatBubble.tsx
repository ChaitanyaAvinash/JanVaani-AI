import { Mic, Camera, Sparkles } from "lucide-react";
import { CategoryBadge, UrgencyBadge } from "@/components/ui/badges";
import { CATEGORY_META } from "@/lib/categories";
import { t, wardLabel, type Lang } from "@/lib/i18n";
import type { SubmissionDTO } from "@/lib/types";

function UserBubble({ submission }: { submission: SubmissionDTO }) {
  return (
    <div className="flex justify-end">
      <div
        className="max-w-[85%] rounded-2xl rounded-tr-sm px-4 py-3 text-sm"
        style={{ backgroundColor: "var(--brand)", color: "#ffffff" }}
      >
        {submission.channel === "voice" && (
          <div className="mb-1 flex items-center gap-1.5 text-xs opacity-90">
            <Mic size={13} /> Voice message
          </div>
        )}
        {submission.channel === "photo" && !submission.rawText && (
          <div className="mb-1 flex items-center gap-1.5 text-xs opacity-90">
            <Camera size={13} /> Photo
          </div>
        )}
        {submission.photoDataUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={submission.photoDataUrl}
            alt="Attached"
            className="mb-2 max-h-48 rounded-lg object-cover"
          />
        )}
        {submission.audioDataUrl && (
          <audio controls src={submission.audioDataUrl} className="mb-2 h-8 w-full" />
        )}
        {submission.rawText && <p className="whitespace-pre-wrap">{submission.rawText}</p>}
      </div>
    </div>
  );
}

function AssistantAckBubble({ submission, lang }: { submission: SubmissionDTO; lang: Lang }) {
  const categoryLabel = submission.category ? CATEGORY_META[submission.category].label[lang] : "";
  const ward = submission.ward ? wardLabel(submission.ward, lang) : "";

  return (
    <div className="flex justify-start">
      <div
        className="max-w-[85%] rounded-2xl rounded-tl-sm border px-4 py-3 text-sm"
        style={{ backgroundColor: "var(--surface-1)", borderColor: "var(--border)" }}
      >
        <div className="mb-2 flex items-center gap-1.5 text-xs font-medium" style={{ color: "var(--brand)" }}>
          <Sparkles size={13} /> JanVaani AI
        </div>
        {submission.summary && (
          <p className="mb-2" style={{ color: "var(--text-primary)" }}>
            {submission.summary}
          </p>
        )}
        <div className="mb-2 flex flex-wrap gap-1.5">
          {submission.category && <CategoryBadge category={submission.category} lang={lang} />}
          {submission.urgency != null && <UrgencyBadge urgency={submission.urgency} />}
        </div>
        <p className="text-xs" style={{ color: "var(--text-secondary)" }}>
          {t(lang, "thanksHeading")} {t(lang, "addedTo")}{" "}
          <strong>{categoryLabel}</strong> {t(lang, "priorityListFor")} <strong>{ward}</strong>.
        </p>
      </div>
    </div>
  );
}

export function ChatBubblePair({ submission, lang }: { submission: SubmissionDTO; lang: Lang }) {
  return (
    <div className="flex flex-col gap-2">
      <UserBubble submission={submission} />
      <AssistantAckBubble submission={submission} lang={lang} />
    </div>
  );
}
