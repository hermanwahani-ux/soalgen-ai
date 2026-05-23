import type { Question } from "./generator";

export type DocMeta = {
  title: string;
  subjectLabel: string;
  phaseLabel: string;
  topic: string;
  formatLabel: string;
  difficulty: string;
  cognitive: string;
  count: number;
  generatedAt: Date;
};

// ---------- HTML Renderers (used both for print + Word + PDF) ----------

const F4_STYLES = `
  @page { size: 210mm 330mm; margin: 20mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; color: #111; font-size: 12pt; line-height: 1.5; margin: 0; }
  .doc { max-width: 174mm; margin: 0 auto; }
  .doc-header { text-align: center; border-bottom: 3px double #111; padding-bottom: 10px; margin-bottom: 16px; }
  .doc-header h1 { font-size: 16pt; margin: 0 0 4px; text-transform: uppercase; letter-spacing: 1px; }
  .doc-header h2 { font-size: 13pt; margin: 0; font-weight: normal; }
  .meta-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; font-size: 11pt; }
  .meta-table td { padding: 2px 6px; vertical-align: top; }
  .meta-table td.lbl { width: 28%; font-weight: bold; }
  .meta-table td.sep { width: 2%; }
  .instr { border: 1px solid #555; padding: 8px 12px; margin-bottom: 14px; font-size: 11pt; }
  .instr b { display: block; margin-bottom: 4px; }
  h3.section { font-size: 13pt; margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 2px solid #111; }
  .q { margin-bottom: 14px; page-break-inside: avoid; }
  .q .num { font-weight: bold; }
  .q .context { font-style: italic; margin: 4px 0; color: #333; }
  .q .stem { margin: 4px 0; text-align: justify; }
  .q ol.opts { list-style: upper-alpha; padding-left: 24px; margin: 6px 0; }
  .q ol.opts li { margin: 2px 0; }
  .q .pairs { display: flex; gap: 20px; margin-top: 6px; }
  .q .pairs > div { flex: 1; }
  .q .pairs ul { padding-left: 18px; margin: 4px 0; }
  .visual { border: 1.5px solid #444; padding: 10px; margin: 8px 0; background: #fafafa; page-break-inside: avoid; }
  .visual .vtitle { font-weight: bold; font-size: 11pt; margin-bottom: 6px; text-align: center; }
  .visual .vcaption { font-size: 10pt; text-align: center; font-style: italic; color: #444; }
  .vtable { width: 100%; border-collapse: collapse; font-size: 11pt; }
  .vtable th, .vtable td { border: 1px solid #444; padding: 4px 8px; text-align: left; }
  .vtable th { background: #e9e9e9; }
  .bar { display: flex; align-items: center; gap: 8px; margin: 3px 0; font-size: 10.5pt; }
  .bar .blabel { width: 50px; }
  .bar .btrack { flex: 1; height: 14px; background: #e0e0e0; border: 1px solid #888; position: relative; }
  .bar .bfill { height: 100%; background: #555; }
  .bar .bval { width: 40px; text-align: right; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; }
  .stat { border: 1px solid #777; padding: 6px; text-align: center; }
  .stat .sv { font-size: 13pt; font-weight: bold; }
  .stat .sl { font-size: 9pt; color: #444; }
  .answer-key { margin: 10px 0; }
  .ak-table { width: 100%; border-collapse: collapse; font-size: 11pt; }
  .ak-table th, .ak-table td { border: 1px solid #444; padding: 5px 8px; }
  .ak-table th { background: #e9e9e9; }
  .ak-table td.no { width: 8%; text-align: center; font-weight: bold; }
  .ak-table td.key { width: 18%; text-align: center; font-weight: bold; }
  .kisi-table { width: 100%; border-collapse: collapse; font-size: 10pt; table-layout: fixed; }
  .kisi-table th, .kisi-table td { border: 1px solid #444; padding: 4px 6px; vertical-align: top; word-wrap: break-word; }
  .kisi-table th { background: #d9d9d9; text-align: center; font-size: 10pt; }
  .kisi-table .c { text-align: center; }
  .pembahasan { margin-bottom: 12px; page-break-inside: avoid; }
  .pembahasan .ph { font-weight: bold; margin-bottom: 3px; }
  .pembahasan .pa { background: #f0f0f0; border-left: 3px solid #333; padding: 4px 8px; margin: 3px 0; font-weight: bold; }
  .footer { margin-top: 24px; padding-top: 8px; border-top: 1px solid #888; font-size: 9pt; text-align: center; color: #666; }
  .signature { margin-top: 30px; display: flex; justify-content: flex-end; }
  .signature .sig-box { width: 60mm; text-align: center; font-size: 11pt; }
  .signature .sig-line { margin-top: 50px; border-bottom: 1px solid #111; }
`;

function visualHtml(v: NonNullable<Question["visual"]>): string {
  if (v.type === "table") {
    const headers = (v.headers || []).map((h) => `<th>${h}</th>`).join("");
    const rows = (v.rows || [])
      .map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`)
      .join("");
    return `<div class="visual"><div class="vtitle">${v.title}</div><table class="vtable"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  if (v.type === "chart") {
    const data = v.data || [];
    const max = Math.max(...data.map((d) => d.value), 1);
    const bars = data
      .map(
        (d) =>
          `<div class="bar"><div class="blabel">${d.label}</div><div class="btrack"><div class="bfill" style="width:${(d.value / max) * 100}%"></div></div><div class="bval">${d.value}</div></div>`
      )
      .join("");
    return `<div class="visual"><div class="vtitle">${v.title}</div>${bars}</div>`;
  }
  if (v.type === "infographic") {
    const stats = (v.stats || [])
      .map(
        (s) =>
          `<div class="stat"><div>${s.icon}</div><div class="sv">${s.value}</div><div class="sl">${s.label}</div></div>`
      )
      .join("");
    return `<div class="visual"><div class="vtitle">${v.title}</div><div class="stats">${stats}</div></div>`;
  }
  // image / map
  return `<div class="visual"><div class="vtitle">${v.title}</div><div style="text-align:center;font-size:48pt;">${v.emoji || "🖼️"}</div><div class="vcaption">${v.caption || ""}</div></div>`;
}

function questionHtml(q: Question, includeAnswer = false): string {
  let body = "";
  if (q.context) body += `<div class="context">${q.context}</div>`;
  if (q.visual) body += visualHtml(q.visual);
  body += `<div class="stem">${q.stem}</div>`;
  if (q.options) {
    body += `<ol class="opts">${q.options.map((o) => `<li>${o.text}</li>`).join("")}</ol>`;
  }
  if (q.pairs) {
    const left = q.pairs.map((p, i) => `<li>${i + 1}. ${p.left}</li>`).join("");
    const right = q.pairs.map((p, i) => `<li>${String.fromCharCode(65 + i)}. ${p.right}</li>`).join("");
    body += `<div class="pairs"><div><b>Kolom A</b><ul>${left}</ul></div><div><b>Kolom B</b><ul>${right}</ul></div></div>`;
  }
  if (q.format === "isian" || q.format === "uraian") {
    body += `<div style="border-bottom:1px dotted #888;margin-top:10px;">&nbsp;</div><div style="border-bottom:1px dotted #888;margin-top:14px;">&nbsp;</div>${q.format === "uraian" ? `<div style="border-bottom:1px dotted #888;margin-top:14px;">&nbsp;</div>` : ""}`;
  }
  if (includeAnswer) {
    body += `<div class="pa">Kunci: ${q.answer}</div>`;
  }
  return `<div class="q"><span class="num">${q.number}.</span> ${body}</div>`;
}

function headerBlockHtml(meta: DocMeta, subtitle: string): string {
  return `
    <div class="doc-header">
      <h1>${subtitle}</h1>
      <h2>${meta.subjectLabel} — ${meta.topic}</h2>
    </div>
    <table class="meta-table">
      <tr><td class="lbl">Mata Pelajaran</td><td class="sep">:</td><td>${meta.subjectLabel}</td>
          <td class="lbl">Jumlah Soal</td><td class="sep">:</td><td>${meta.count} butir</td></tr>
      <tr><td class="lbl">Fase / Kelas</td><td class="sep">:</td><td>${meta.phaseLabel}</td>
          <td class="lbl">Format</td><td class="sep">:</td><td>${meta.formatLabel}</td></tr>
      <tr><td class="lbl">Topik / Materi</td><td class="sep">:</td><td>${meta.topic}</td>
          <td class="lbl">Tingkat</td><td class="sep">:</td><td style="text-transform:capitalize">${meta.difficulty}</td></tr>
      <tr><td class="lbl">Level Kognitif</td><td class="sep">:</td><td>${meta.cognitive}</td>
          <td class="lbl">Tanggal</td><td class="sep">:</td><td>${meta.generatedAt.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</td></tr>
    </table>
  `;
}

// ---------- SOAL ----------
export function renderSoalHtml(meta: DocMeta, questions: Question[]): string {
  return `
    ${headerBlockHtml(meta, "Lembar Soal")}
    <div class="instr"><b>Petunjuk Pengerjaan:</b>
      1. Tulis nama, kelas, dan nomor presensi pada lembar jawaban. <br/>
      2. Bacalah setiap soal dengan teliti sebelum menjawab. <br/>
      3. Kerjakan soal yang dianggap mudah terlebih dahulu. <br/>
      4. Periksa kembali jawaban Anda sebelum dikumpulkan.
    </div>
    <h3 class="section">SOAL</h3>
    ${questions.map((q) => questionHtml(q, false)).join("")}
    <div class="footer">— Selamat mengerjakan —</div>
  `;
}

// ---------- KISI-KISI ----------
export function renderKisiKisiHtml(meta: DocMeta, questions: Question[]): string {
  const rows = questions
    .map(
      (q) => `
      <tr>
        <td class="c">${q.number}</td>
        <td>${meta.topic}</td>
        <td>${meta.subjectLabel} - ${meta.phaseLabel}</td>
        <td>Peserta didik mampu ${q.stem.replace(/\.$/, "").toLowerCase()}</td>
        <td class="c">${q.cognitive}</td>
        <td class="c">${q.format}</td>
        <td class="c" style="text-transform:capitalize">${q.difficulty}</td>
        <td class="c">${q.number}</td>
      </tr>`
    )
    .join("");
  return `
    ${headerBlockHtml(meta, "Kisi-Kisi Soal")}
    <table class="kisi-table">
      <colgroup>
        <col style="width:4%"/><col style="width:14%"/><col style="width:14%"/>
        <col style="width:28%"/><col style="width:9%"/><col style="width:12%"/>
        <col style="width:10%"/><col style="width:9%"/>
      </colgroup>
      <thead>
        <tr>
          <th>No</th>
          <th>Materi / Topik</th>
          <th>Capaian Pembelajaran</th>
          <th>Indikator Soal</th>
          <th>Level Kognitif</th>
          <th>Bentuk Soal</th>
          <th>Tingkat Kesulitan</th>
          <th>No. Soal</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="signature">
      <div class="sig-box">
        <div>${meta.generatedAt.toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}</div>
        <div>Guru Mata Pelajaran,</div>
        <div class="sig-line"></div>
        <div>(__________________)</div>
      </div>
    </div>
  `;
}

// ---------- KUNCI JAWABAN & PEMBAHASAN ----------
export function renderKunciHtml(meta: DocMeta, questions: Question[]): string {
  const rows = questions
    .map(
      (q) => `<tr><td class="no">${q.number}</td><td class="key">${q.answer}</td><td>${q.format}</td><td style="text-transform:capitalize">${q.difficulty}</td><td class="c">${q.cognitive}</td></tr>`
    )
    .join("");
  const pemb = questions
    .map(
      (q) => `
      <div class="pembahasan">
        <div class="ph">Soal No. ${q.number} <span style="font-weight:normal;color:#555">[${q.format} • ${q.difficulty} • ${q.cognitive}]</span></div>
        <div style="font-size:11pt;">${q.stem}</div>
        <div class="pa">Kunci Jawaban: ${q.answer}</div>
        <div><b>Pembahasan:</b> ${q.explanation}</div>
      </div>`
    )
    .join("");
  return `
    ${headerBlockHtml(meta, "Kunci Jawaban & Pembahasan")}
    <h3 class="section">A. Ringkasan Kunci Jawaban</h3>
    <table class="ak-table">
      <thead><tr><th>No</th><th>Kunci</th><th>Bentuk</th><th>Kesulitan</th><th>Level</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <h3 class="section" style="margin-top:20px">B. Pembahasan Lengkap</h3>
    ${pemb}
  `;
}

// ---------- Build full document ----------
function buildFullHtml(title: string, bodyHtml: string): string {
  return `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title><style>${F4_STYLES}</style></head><body><div class="doc">${bodyHtml}</div></body></html>`;
}

// ---------- Print ----------
export function printDocument(title: string, bodyHtml: string) {
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) {
    alert("Pop-up diblokir. Mohon izinkan pop-up untuk fitur cetak.");
    return;
  }
  w.document.open();
  w.document.write(buildFullHtml(title, bodyHtml));
  w.document.close();
  w.onload = () => {
    setTimeout(() => {
      w.focus();
      w.print();
    }, 250);
  };
}

// ---------- Download Word ----------
export function downloadWord(filename: string, title: string, bodyHtml: string) {
  // Word-compatible HTML with explicit F4 page setup
  const wordHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office"
          xmlns:w="urn:schemas-microsoft-com:office:word"
          xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8">
        <title>${title}</title>
        <!--[if gte mso 9]>
        <xml>
          <w:WordDocument>
            <w:View>Print</w:View>
            <w:Zoom>100</w:Zoom>
          </w:WordDocument>
        </xml>
        <![endif]-->
        <style>
          @page WordSection1 {
            size: 210mm 330mm;
            margin: 20mm 18mm 20mm 20mm;
            mso-page-orientation: portrait;
          }
          div.WordSection1 { page: WordSection1; }
          ${F4_STYLES}
        </style>
      </head>
      <body>
        <div class="WordSection1"><div class="doc">${bodyHtml}</div></div>
      </body>
    </html>`;
  const blob = new Blob(["\ufeff", wordHtml], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".doc") ? filename : `${filename}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Download PDF ----------
export async function downloadPdf(filename: string, title: string, bodyHtml: string) {
  const html2pdf = (await import("html2pdf.js")).default;
  const container = document.createElement("div");
  container.innerHTML = `<style>${F4_STYLES}</style><div class="doc">${bodyHtml}</div>`;
  // Force size for accurate rendering
  container.style.width = "174mm";
  container.style.background = "#fff";
  container.style.padding = "0";
  document.body.appendChild(container);
  try {
    await html2pdf()
      .set({
        margin: [20, 18, 20, 18],
        filename: filename.endsWith(".pdf") ? filename : `${filename}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, backgroundColor: "#fff" },
        jsPDF: { unit: "mm", format: [210, 330], orientation: "portrait" },
      } as any)
      .from(container)
      .save();
  } finally {
    document.body.removeChild(container);
  }
  // Mark title used (avoid lint)
  void title;
}
