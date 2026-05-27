import { useMemo, useState } from "react";
import {
  SUBJECTS,
  PHASES,
  FORMATS,
  DIFFICULTIES,
  COGNITIVE_LEVELS,
  VISUAL_TYPES,
} from "./data/curriculum";
import {
  generateQuestionsMock,
  simulateLatency,
  type Question,
} from "./utils/generator";
import { QuestionCard } from "./components/QuestionCard";
import { ExportToolbar } from "./components/ExportToolbar";
import type { DocMeta } from "./utils/exporters";

export default function App() {
  const [subject, setSubject] = useState("matematika");
  const [customSubject, setCustomSubject] = useState("");
  const [phase, setPhase] = useState("D");
  const [topic, setTopic] = useState("Bilangan Pecahan dan Operasinya");
  const [format, setFormat] = useState("pg");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("sedang");
  const [cognitive, setCognitive] = useState("C3");
  const [useVisuals, setUseVisuals] = useState(true);
  const [visualTypes, setVisualTypes] = useState<string[]>(["grafik", "infografis"]);

  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generatedAt, setGeneratedAt] = useState<Date | null>(null);

  const subjectInfo = useMemo(() => {
    const base = SUBJECTS.find((s) => s.value === subject)!;
    if (subject === "lainnya" && customSubject.trim()) {
      return { ...base, label: customSubject.trim() };
    }
    return base;
  }, [subject, customSubject]);
  const isCustomSubject = subject === "lainnya";
  const canGenerate =
    topic.trim().length > 0 && (!isCustomSubject || customSubject.trim().length > 0);
  const phaseInfo = useMemo(() => PHASES.find((p) => p.value === phase)!, [phase]);
  const formatInfo = useMemo(() => FORMATS.find((f) => f.value === format)!, [format]);
  const cognitiveInfo = useMemo(() => COGNITIVE_LEVELS.find((c) => c.value === cognitive)!, [cognitive]);

  const toggleVisualType = (v: string) => {
    setVisualTypes((prev) =>
      prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
    );
  };

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    await simulateLatency(count);
    const qs = generateQuestionsMock({
      subject,
      subjectLabel: subjectInfo.label,
      phase,
      phaseLabel: phaseInfo.label,
      topic: topic.trim(),
      format,
      formatLabel: formatInfo.label,
      count,
      difficulty,
      cognitive,
      cognitiveLabel: cognitiveInfo.label,
      useVisuals,
      visualTypes,
    });
    setQuestions(qs);
    setGeneratedAt(new Date());
    setLoading(false);
  };

  const docMeta: DocMeta | null = useMemo(() => {
    if (!generatedAt) return null;
    return {
      title: `Soal ${subjectInfo.label}`,
      subjectLabel: subjectInfo.label,
      phaseLabel: `${phaseInfo.label} (${phaseInfo.desc})`,
      topic: topic.trim(),
      formatLabel: formatInfo.label,
      difficulty,
      cognitive: cognitiveInfo.label,
      count: questions.length,
      generatedAt,
    };
  }, [generatedAt, subjectInfo, phaseInfo, topic, formatInfo, difficulty, cognitiveInfo, questions.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50/40">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-white/70 border-b border-slate-200/70 print:hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-lg shadow-violet-200">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2 L14 8 L20 9 L15.5 13.5 L17 20 L12 16.5 L7 20 L8.5 13.5 L4 9 L10 8 Z" />
            </svg>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">SoalGen AI</h1>
            <p className="text-[11px] text-slate-500 -mt-0.5">Generator Soal Cerdas berbasis Kurikulum Merdeka</p>
          </div>
          <div className="ml-auto hidden sm:flex items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-emerald-700 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              AI Online
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-6 grid lg:grid-cols-[380px_1fr] gap-6">
        {/* Form panel */}
        <aside className="print:hidden">
          <div className="lg:sticky lg:top-20 space-y-4">
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 space-y-5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-indigo-700 text-xs">⚙️</span>
                  Konfigurasi Soal
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Atur parameter untuk AI menghasilkan soal sesuai kebutuhan.</p>
              </div>

              {/* Mata Pelajaran */}
              <Field label="Mata Pelajaran" hint="Pilih mapel utama soal">
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.icon} {s.label}
                    </option>
                  ))}
                </select>
                {isCustomSubject && (
                  <div className="mt-2 rounded-lg border border-indigo-200 bg-indigo-50/50 p-2.5">
                    <label className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-700 mb-1.5">
                      <span>✨</span>
                      Nama Mata Pelajaran Khusus
                    </label>
                    <input
                      type="text"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      placeholder="Contoh: Prakarya, Mulok Bahasa Sunda, Tahfidz..."
                      className="w-full rounded-md border border-indigo-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                    />
                    {!customSubject.trim() && (
                      <p className="mt-1 text-[10px] text-indigo-600/70">
                        Wajib diisi sebelum membuat soal.
                      </p>
                    )}
                  </div>
                )}
              </Field>

              {/* Fase */}
              <Field label="Fase Kurikulum Merdeka" hint={phaseInfo.desc}>
                <div className="grid grid-cols-6 gap-1.5">
                  {PHASES.map((p) => (
                    <button
                      key={p.value}
                      type="button"
                      onClick={() => setPhase(p.value)}
                      className={`px-2 py-2 rounded-lg text-xs font-bold border transition-all ${
                        phase === p.value
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200"
                          : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300"
                      }`}
                    >
                      {p.value}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Topik */}
              <Field label="Topik / Materi" hint="Cantumkan topik spesifik">
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={2}
                  placeholder="Contoh: Sistem peredaran darah pada manusia"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                />
              </Field>

              {/* Format */}
              <Field label="Format Soal">
                <div className="grid grid-cols-2 gap-1.5">
                  {FORMATS.map((f) => (
                    <button
                      key={f.value}
                      type="button"
                      onClick={() => setFormat(f.value)}
                      className={`px-2.5 py-2 rounded-lg text-xs font-semibold border text-left transition-all ${
                        format === f.value
                          ? "bg-violet-50 text-violet-700 border-violet-300 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-violet-200"
                      }`}
                    >
                      <span className="mr-1">{f.icon}</span>
                      {f.label}
                    </button>
                  ))}
                </div>
              </Field>

              {/* Jumlah */}
              <Field label={`Jumlah Soal: ${count}`}>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>1</span><span>10</span><span>20</span>
                </div>
              </Field>

              {/* Tingkat Kesulitan */}
              <Field label="Tingkat Kesulitan">
                <div className="grid grid-cols-4 gap-1.5">
                  {DIFFICULTIES.map((d) => {
                    const active = difficulty === d.value;
                    const colorMap: Record<string, string> = {
                      emerald: active ? "bg-emerald-500 text-white border-emerald-500" : "border-slate-200 text-slate-600",
                      amber: active ? "bg-amber-500 text-white border-amber-500" : "border-slate-200 text-slate-600",
                      rose: active ? "bg-rose-500 text-white border-rose-500" : "border-slate-200 text-slate-600",
                      violet: active ? "bg-violet-500 text-white border-violet-500" : "border-slate-200 text-slate-600",
                    };
                    return (
                      <button
                        key={d.value}
                        type="button"
                        onClick={() => setDifficulty(d.value)}
                        className={`px-2 py-2 rounded-lg text-xs font-semibold border transition-all ${colorMap[d.color]}`}
                      >
                        {d.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              {/* Level Kognitif */}
              <Field label="Level Kognitif (Bloom)" hint={cognitiveInfo.desc}>
                <select
                  value={cognitive}
                  onChange={(e) => setCognitive(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none"
                >
                  {COGNITIVE_LEVELS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </Field>

              {/* Visuals */}
              <Field label="Gunakan Media Visual">
                <label className="flex items-center gap-2.5 cursor-pointer mb-2">
                  <input
                    type="checkbox"
                    checked={useVisuals}
                    onChange={(e) => setUseVisuals(e.target.checked)}
                    className="h-4 w-4 rounded accent-indigo-600"
                  />
                  <span className="text-sm text-slate-700">
                    Sertakan gambar / infografis / grafik
                  </span>
                </label>
                {useVisuals && (
                  <div className="grid grid-cols-2 gap-1.5 mt-2 pl-1">
                    {VISUAL_TYPES.map((v) => {
                      const active = visualTypes.includes(v.value);
                      return (
                        <button
                          key={v.value}
                          type="button"
                          onClick={() => toggleVisualType(v.value)}
                          className={`px-2.5 py-1.5 rounded-md text-[11px] font-semibold border transition-all text-left ${
                            active
                              ? "bg-indigo-50 text-indigo-700 border-indigo-300"
                              : "bg-white text-slate-500 border-slate-200 hover:border-indigo-200"
                          }`}
                        >
                          <span className="mr-1">{v.icon}</span>
                          {v.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </Field>

              <button
                onClick={handleGenerate}
                disabled={loading || !canGenerate}
                className="w-full rounded-xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-violet-200 hover:shadow-xl hover:shadow-violet-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Menghasilkan soal...
                  </>
                ) : (
                  <>
                    <span>✨</span>
                    {questions.length > 0 ? "Buat Ulang" : "Generate Soal"}
                  </>
                )}
              </button>
            </div>

            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-5 text-white shadow-lg shadow-violet-200">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">💡</span>
                <h3 className="font-bold text-sm">Tips Pro</h3>
              </div>
              <ul className="text-xs space-y-1.5 text-white/90">
                <li>• Spesifikkan topik (mis. "Hukum Newton 1") untuk hasil lebih relevan.</li>
                <li>• Pilih HOTS untuk asesmen berpikir kritis.</li>
                <li>• Tambah visual untuk soal berbasis stimulus.</li>
              </ul>
            </div>
          </div>
        </aside>

        {/* Results */}
        <section>
          {questions.length === 0 && !loading && (
            <EmptyState />
          )}

          {loading && <LoadingState count={count} />}

          {questions.length > 0 && !loading && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-5 print:shadow-none print:border-0">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <span>{subjectInfo.icon}</span>
                      {subjectInfo.label} — {topic}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      {phaseInfo.label} • {phaseInfo.desc} • {formatInfo.label} • Level {cognitive}
                    </p>
                  </div>
                  <div className="flex gap-2 print:hidden">
                    <a
                      href="#export-panel"
                      className="rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-90 inline-flex items-center gap-1.5"
                    >
                      ⬇️ Cetak / Unduh
                    </a>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <StatPill label="Total Soal" value={String(questions.length)} icon="📝" />
                  <StatPill label="Format" value={formatInfo.label} icon={formatInfo.icon} />
                  <StatPill label="Kesulitan" value={difficulty} icon="🎯" />
                  <StatPill label="Visual" value={useVisuals ? `${questions.filter(q => q.visual).length} soal` : "Tidak"} icon="🖼️" />
                </div>
                {generatedAt && (
                  <p className="text-[10px] text-slate-400 mt-3">
                    Dihasilkan {generatedAt.toLocaleString("id-ID")}
                  </p>
                )}
              </div>

              {docMeta && (
                <div id="export-panel" className="scroll-mt-24">
                  <ExportToolbar questions={questions} meta={docMeta} />
                </div>
              )}

              <div className="space-y-4">
                {questions.map((q) => (
                  <QuestionCard key={q.number} q={q} />
                ))}
              </div>

              <div className="text-center py-6 text-xs text-slate-400 print:hidden">
                ✨ Akhir dari paket soal • {questions.length} soal dihasilkan oleh SoalGen AI
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-baseline justify-between mb-1.5">
        <label className="text-xs font-semibold text-slate-700">{label}</label>
        {hint && <span className="text-[10px] text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function StatPill({ label, value, icon }: { label: string; value: string; icon: string }) {
  return (
    <div className="rounded-xl bg-gradient-to-br from-slate-50 to-white border border-slate-200 px-3 py-2">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
        <span>{icon}</span>
        {label}
      </div>
      <div className="text-sm font-bold text-slate-900 mt-0.5 capitalize truncate">{value}</div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/60 backdrop-blur p-10 sm:p-16 text-center">
      <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-100 via-violet-100 to-fuchsia-100 mb-5">
        <span className="text-4xl">🎓</span>
      </div>
      <h3 className="text-xl font-bold text-slate-900">Siap Membuat Soal?</h3>
      <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
        Atur parameter di panel kiri — mulai dari mata pelajaran, fase kurikulum, topik, hingga level kognitif —
        lalu tekan tombol <span className="font-semibold text-indigo-600">Generate Soal</span>.
      </p>
      <div className="mt-8 grid sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-left">
        <FeatureCard icon="🎯" title="Sesuai Kurikulum" desc="Fase A hingga F sesuai Kurikulum Merdeka." />
        <FeatureCard icon="🧠" title="Taksonomi Bloom" desc="C1 - C6, HOTS & LOTS terdukung." />
        <FeatureCard icon="📊" title="Visual & Stimulus" desc="Grafik, tabel, infografis otomatis." />
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="text-sm font-bold text-slate-900">{title}</div>
      <div className="text-xs text-slate-500 mt-1 leading-relaxed">{desc}</div>
    </div>
  );
}

function LoadingState({ count }: { count: number }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-8 text-center">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 mb-4 animate-pulse">
          <svg className="h-8 w-8 text-white animate-spin" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3" />
            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-slate-900">AI sedang merangkai soal...</h3>
        <p className="text-xs text-slate-500 mt-1">Menyusun {count} soal sesuai parameter Anda</p>
      </div>
      {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
        <div key={i} className="rounded-2xl bg-white border border-slate-200 p-5 space-y-3">
          <div className="flex gap-2">
            <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
            <div className="h-8 flex-1 rounded bg-slate-100 animate-pulse" />
          </div>
          <div className="h-4 w-3/4 rounded bg-slate-100 animate-pulse" />
          <div className="h-4 w-full rounded bg-slate-100 animate-pulse" />
          <div className="h-20 w-full rounded-lg bg-slate-100 animate-pulse" />
          <div className="space-y-1.5">
            <div className="h-3 w-2/3 rounded bg-slate-100 animate-pulse" />
            <div className="h-3 w-1/2 rounded bg-slate-100 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}<div>
  <label className="flex cursor-pointer items-center gap-3 p-3 rounded-xl border border-zinc-200 bg-white transition hover:border-violet-300 hover:bg-violet-50/30">
    <input
      type="checkbox"
      checked={config.gunakanVisual}
      onChange={e => setConfig({...config, gunakanVisual: e.target.checked})}
      className="h-5 w-5 rounded border-zinc-300 text-violet-600 focus:ring-violet-500 cursor-pointer"
    />
    <div>
      <div className="flex items-center gap-1.5 text-[13px] font-medium text-zinc-900">
        <ImageIcon className="h-4 w-4 text-violet-600" />
        Sertakan Gambar
      </div>
      <p className="text-[11px] text-zinc-500 mt-0.5">AI akan generate ilustrasi relevan</p>
    </div>
  </label>
</div>
