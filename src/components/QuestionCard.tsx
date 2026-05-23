import { useState } from "react";
import type { Question } from "../utils/generator";
import { VisualBlock } from "./VisualBlock";

const DIFF_STYLES: Record<string, string> = {
  mudah: "bg-emerald-100 text-emerald-700 border-emerald-200",
  sedang: "bg-amber-100 text-amber-700 border-amber-200",
  sulit: "bg-rose-100 text-rose-700 border-rose-200",
};

const FORMAT_LABELS: Record<string, string> = {
  pg: "Pilihan Ganda",
  "pg-kompleks": "PG Kompleks",
  "benar-salah": "Benar/Salah",
  menjodohkan: "Menjodohkan",
  isian: "Isian Singkat",
  uraian: "Uraian",
};

export function QuestionCard({ q }: { q: Question }) {
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-5 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-sm shadow-indigo-200">
          {q.number}
        </div>
        <span className="text-xs font-semibold text-slate-600">Soal {q.number}</span>
        <span className="ml-auto flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-100">
            {FORMAT_LABELS[q.format] || q.format}
          </span>
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${DIFF_STYLES[q.difficulty] || DIFF_STYLES.sedang}`}>
            {q.difficulty}
          </span>
          <span className="inline-flex items-center rounded-full bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold text-violet-700 border border-violet-100">
            {q.cognitive}
          </span>
        </span>
      </div>

      <div className="p-5 space-y-3">
        {q.context && (
          <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 border-l-2 border-indigo-300 px-3 py-2 rounded-r">
            {q.context}
          </p>
        )}

        {q.visual && <VisualBlock visual={q.visual} />}

        <p className="text-[15px] text-slate-900 leading-relaxed font-medium">
          {q.stem}
        </p>

        {q.options && (
          <ul className="space-y-1.5 mt-3">
            {q.options.map((o) => (
              <li key={o.key} className="flex gap-3 items-start text-sm text-slate-700">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
                  {o.key}
                </span>
                <span className="pt-0.5">{o.text}</span>
              </li>
            ))}
          </ul>
        )}

        {q.pairs && (
          <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-500 uppercase">Kolom A</div>
              {q.pairs.map((p, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                  {i + 1}. {p.left}
                </div>
              ))}
            </div>
            <div className="space-y-1.5">
              <div className="text-xs font-semibold text-slate-500 uppercase">Kolom B</div>
              {q.pairs.map((p, i) => (
                <div key={i} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700">
                  {String.fromCharCode(65 + i)}. {p.right}
                </div>
              ))}
            </div>
          </div>
        )}

        {(q.format === "isian" || q.format === "uraian") && (
          <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/50 px-4 py-3 text-xs text-slate-400 italic">
            {q.format === "isian" ? "Tulis jawaban singkat pada bagian rumpang." : "Tulis jawaban uraian lengkap pada lembar jawaban."}
          </div>
        )}

        <div className="mt-4 pt-3 border-t border-dashed border-slate-200">
          <button
            onClick={() => setShowAnswer((v) => !v)}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 inline-flex items-center gap-1.5"
          >
            <span className={`transition-transform ${showAnswer ? "rotate-90" : ""}`}>▶</span>
            {showAnswer ? "Sembunyikan kunci jawaban" : "Tampilkan kunci jawaban & pembahasan"}
          </button>
          {showAnswer && (
            <div className="mt-3 space-y-2 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Kunci Jawaban</div>
                <div className="text-sm font-semibold text-emerald-900 mt-0.5">{q.answer}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Pembahasan</div>
                <div className="text-sm text-slate-700 mt-0.5 leading-relaxed">{q.explanation}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
