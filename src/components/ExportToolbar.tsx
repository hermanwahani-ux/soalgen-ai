import { useState } from "react";
import type { Question } from "../utils/generator";
import {
  type DocMeta,
  renderSoalHtml,
  renderKisiKisiHtml,
  renderKunciHtml,
  printDocument,
  downloadWord,
  downloadPdf,
} from "../utils/exporters";

type DocKind = "soal" | "kisi" | "kunci";

const DOC_CONFIG: Record<DocKind, { label: string; title: string; icon: string; color: string }> = {
  soal: { label: "Lembar Soal", title: "Lembar Soal", icon: "📝", color: "indigo" },
  kisi: { label: "Kisi-Kisi", title: "Kisi-Kisi Soal", icon: "🗂️", color: "violet" },
  kunci: { label: "Kunci & Pembahasan", title: "Kunci Jawaban & Pembahasan", icon: "🔑", color: "emerald" },
};

export function ExportToolbar({
  questions,
  meta,
}: {
  questions: Question[];
  meta: DocMeta;
}) {
  const [busy, setBusy] = useState<string | null>(null);

  const buildHtml = (kind: DocKind) => {
    if (kind === "soal") return renderSoalHtml(meta, questions);
    if (kind === "kisi") return renderKisiKisiHtml(meta, questions);
    return renderKunciHtml(meta, questions);
  };

  const filenameFor = (kind: DocKind) => {
    const safe = meta.subjectLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const prefix =
      kind === "soal" ? "soal" : kind === "kisi" ? "kisi-kisi" : "kunci-jawaban";
    const date = meta.generatedAt.toISOString().slice(0, 10);
    return `${prefix}-${safe}-${date}`;
  };

  const handlePrint = (kind: DocKind) => {
    const html = buildHtml(kind);
    printDocument(DOC_CONFIG[kind].title, html);
  };

  const handleWord = async (kind: DocKind) => {
    const id = `word-${kind}`;
    setBusy(id);
    try {
      const html = buildHtml(kind);
      downloadWord(filenameFor(kind), DOC_CONFIG[kind].title, html);
    } finally {
      setTimeout(() => setBusy(null), 400);
    }
  };

  const handlePdf = async (kind: DocKind) => {
    const id = `pdf-${kind}`;
    setBusy(id);
    try {
      const html = buildHtml(kind);
      await downloadPdf(filenameFor(kind), DOC_CONFIG[kind].title, html);
    } catch (e) {
      console.error(e);
      alert("Gagal membuat PDF. Silakan coba lagi.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-4 sm:p-5 print:hidden">
      <div className="flex items-center gap-2 mb-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs">
          📄
        </span>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Cetak & Ekspor Dokumen</h3>
          <p className="text-[11px] text-slate-500">Format kertas F4 (210 × 330 mm) tertata rapi</p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {(Object.keys(DOC_CONFIG) as DocKind[]).map((kind) => {
          const cfg = DOC_CONFIG[kind];
          const colorMap: Record<string, { bg: string; text: string; ring: string; btn: string }> = {
            indigo: { bg: "from-indigo-50 to-white", text: "text-indigo-700", ring: "border-indigo-200", btn: "from-indigo-600 to-indigo-700" },
            violet: { bg: "from-violet-50 to-white", text: "text-violet-700", ring: "border-violet-200", btn: "from-violet-600 to-violet-700" },
            emerald: { bg: "from-emerald-50 to-white", text: "text-emerald-700", ring: "border-emerald-200", btn: "from-emerald-600 to-emerald-700" },
          };
          const c = colorMap[cfg.color];

          return (
            <div key={kind} className={`rounded-xl border ${c.ring} bg-gradient-to-br ${c.bg} p-3 flex flex-col`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xl">{cfg.icon}</span>
                <span className={`text-sm font-bold ${c.text}`}>{cfg.label}</span>
              </div>
              <div className="space-y-1.5 mt-auto">
                <button
                  onClick={() => handlePrint(kind)}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                >
                  🖨️ Cetak
                </button>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => handleWord(kind)}
                    disabled={busy === `word-${kind}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition"
                  >
                    {busy === `word-${kind}` ? "..." : "📘 Word"}
                  </button>
                  <button
                    onClick={() => handlePdf(kind)}
                    disabled={busy === `pdf-${kind}`}
                    className={`inline-flex items-center justify-center gap-1 rounded-lg bg-gradient-to-br ${c.btn} px-2.5 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50 transition`}
                  >
                    {busy === `pdf-${kind}` ? (
                      <span className="inline-flex items-center gap-1">
                        <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                          <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        PDF
                      </span>
                    ) : (
                      "📕 PDF"
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-[11px] text-amber-800">
        <span>💡</span>
        <span>
          <b>Tip:</b> File PDF & Word otomatis menggunakan ukuran kertas <b>F4 (210 × 330 mm)</b> dengan margin 20mm/18mm. File Word dapat diedit kembali sesuai kebutuhan sekolah.
        </span>
      </div>
    </div>
  );
}
