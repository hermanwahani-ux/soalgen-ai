// Mock AI generator that produces realistic questions based on input parameters.
// In a production environment this would call an LLM API (Gemini, OpenAI, etc.)

export type Visual = {
  type: "chart" | "table" | "infographic" | "image";
  title: string;
  // chart
  chartKind?: "bar" | "line" | "pie";
  data?: { label: string; value: number }[];
  // table
  headers?: string[];
  rows?: string[][];
  // infographic
  stats?: { label: string; value: string; icon: string }[];
  // image
  emoji?: string;
  caption?: string;
};

export type Question = {
  number: number;
  format: string;
  difficulty: string;
  cognitive: string;
  stem: string;
  context?: string;
  visual?: Visual;
  options?: { key: string; text: string }[];
  pairs?: { left: string; right: string }[];
  answer: string;
  explanation: string;
};

export type GenerateParams = {
  subject: string;
  subjectLabel: string;
  phase: string;
  phaseLabel: string;
  topic: string;
  format: string;
  formatLabel: string;
  count: number;
  difficulty: string;
  cognitive: string;
  cognitiveLabel: string;
  useVisuals: boolean;
  visualTypes: string[];
};

const DIFF_POOL = ["mudah", "sedang", "sulit"];

function pickDifficulty(d: string, i: number) {
  if (d === "campuran") return DIFF_POOL[i % 3];
  return d;
}

function makeChart(topic: string, i: number): Visual {
  const kinds: Visual["chartKind"][] = ["bar", "line", "pie"];
  const kind = kinds[i % 3];
  const labels = ["2020", "2021", "2022", "2023", "2024"];
  return {
    type: "chart",
    chartKind: kind,
    title: `Data ${topic} (${labels[0]}–${labels[4]})`,
    data: labels.map((l) => ({
      label: l,
      value: Math.round(20 + Math.random() * 80),
    })),
  };
}

function makeTable(topic: string): Visual {
  return {
    type: "table",
    title: `Tabel Data ${topic}`,
    headers: ["Kategori", "Jumlah", "Persentase"],
    rows: [
      ["A", String(Math.round(20 + Math.random() * 50)), `${Math.round(10 + Math.random() * 30)}%`],
      ["B", String(Math.round(20 + Math.random() * 50)), `${Math.round(10 + Math.random() * 30)}%`],
      ["C", String(Math.round(20 + Math.random() * 50)), `${Math.round(10 + Math.random() * 30)}%`],
      ["D", String(Math.round(20 + Math.random() * 50)), `${Math.round(10 + Math.random() * 30)}%`],
    ],
  };
}

function makeInfographic(topic: string): Visual {
  return {
    type: "infographic",
    title: `Fakta Menarik tentang ${topic}`,
    stats: [
      { label: "Pertumbuhan", value: `${Math.round(5 + Math.random() * 50)}%`, icon: "📈" },
      { label: "Total", value: `${Math.round(100 + Math.random() * 900)} unit`, icon: "🎯" },
      { label: "Rata-rata", value: `${Math.round(10 + Math.random() * 90)}`, icon: "⚖️" },
      { label: "Sumber", value: "Data 2024", icon: "📚" },
    ],
  };
}

function makeImage(topic: string, subject: string): Visual {
  const emojiMap: Record<string, string> = {
    matematika: "🔢",
    fisika: "🧲",
    kimia: "🧪",
    biologi: "🌱",
    ipa: "🔭",
    ips: "🏙️",
    sejarah: "📜",
    geografi: "🏔️",
    ekonomi: "💰",
    "bahasa-indonesia": "📖",
    "bahasa-inggris": "🗣️",
    informatika: "🖥️",
    "seni-budaya": "🎭",
    pjok: "🏃",
    pkn: "⚖️",
    agama: "🕌",
  };
  return {
    type: "image",
    title: `Ilustrasi: ${topic}`,
    emoji: emojiMap[subject] || "🖼️",
    caption: `Ilustrasi visual yang menggambarkan konsep "${topic}" untuk mendukung pemahaman peserta didik.`,
  };
}

function pickVisual(params: GenerateParams, i: number): Visual | undefined {
  if (!params.useVisuals || params.visualTypes.length === 0) return undefined;
  // not all questions get visuals — roughly every other one
  if (i % 2 === 1 && params.visualTypes.length === 1) return undefined;
  const type = params.visualTypes[i % params.visualTypes.length];
  switch (type) {
    case "grafik":
      return makeChart(params.topic, i);
    case "tabel":
      return makeTable(params.topic);
    case "infografis":
      return makeInfographic(params.topic);
    case "peta":
      return {
        type: "image",
        title: `Peta: ${params.topic}`,
        emoji: "🗺️",
        caption: `Peta wilayah terkait dengan topik "${params.topic}".`,
      };
    case "gambar":
    default:
      return makeImage(params.topic, params.subject);
  }
}

const STEMS_BY_COG: Record<string, string[]> = {
  C1: [
    "Sebutkan pengertian dari",
    "Apa yang dimaksud dengan",
    "Tuliskan ciri-ciri utama dari",
  ],
  C2: [
    "Jelaskan dengan kalimatmu sendiri konsep",
    "Bagaimana proses terjadinya",
    "Uraikan hubungan antara dua hal pada",
  ],
  C3: [
    "Terapkan rumus/konsep untuk menyelesaikan kasus",
    "Hitunglah berdasarkan informasi di atas mengenai",
    "Gunakan prinsip yang telah dipelajari untuk menjawab masalah",
  ],
  C4: [
    "Analisislah faktor-faktor yang mempengaruhi",
    "Bandingkan dua data berikut terkait",
    "Telaah hubungan sebab-akibat pada",
  ],
  C5: [
    "Nilailah keputusan yang diambil berdasarkan kriteria pada kasus",
    "Berikan penilaian kritis terhadap pernyataan tentang",
    "Evaluasilah dampak jangka panjang dari",
  ],
  C6: [
    "Rancanglah solusi kreatif untuk masalah",
    "Susun strategi baru yang dapat diterapkan pada",
    "Kembangkan ide orisinal mengenai",
  ],
};

function pickStem(cog: string, topic: string, i: number) {
  const key =
    cog === "HOTS" ? ["C4", "C5", "C6"][i % 3]
    : cog === "LOTS" ? ["C1", "C2", "C3"][i % 3]
    : cog;
  const pool = STEMS_BY_COG[key] || STEMS_BY_COG.C2;
  return `${pool[i % pool.length]} ${topic}.`;
}

function makeOptions(i: number, correctIdx: number): { key: string; text: string }[] {
  const variants = [
    "Pernyataan yang menjelaskan konsep secara akurat dan menyeluruh.",
    "Pernyataan dengan sebagian informasi tepat namun ada kekeliruan.",
    "Pernyataan yang umum namun kurang relevan dengan konteks.",
    "Pernyataan yang tidak tepat dan menyesatkan.",
    "Pernyataan dengan sudut pandang berbeda yang menarik.",
  ];
  const letters = ["A", "B", "C", "D", "E"];
  return letters.map((k, idx) => ({
    key: k,
    text: idx === correctIdx
      ? variants[0]
      : variants[(idx + i) % variants.length] || variants[idx],
  }));
}

export function generateQuestionsMock(params: GenerateParams): Question[] {
  const questions: Question[] = [];
  for (let i = 0; i < params.count; i++) {
    const diff = pickDifficulty(params.difficulty, i);
    const cogKey =
      params.cognitive === "HOTS" ? ["C4", "C5", "C6"][i % 3]
      : params.cognitive === "LOTS" ? ["C1", "C2", "C3"][i % 3]
      : params.cognitive;
    const stem = pickStem(params.cognitive, params.topic, i);
    const visual = pickVisual(params, i);
    const context = visual
      ? `Perhatikan ${visual.type === "chart" ? "grafik" : visual.type === "table" ? "tabel" : visual.type === "infographic" ? "infografis" : "gambar"} berikut yang menunjukkan informasi mengenai ${params.topic}. Gunakan informasi tersebut untuk menjawab pertanyaan.`
      : `Bacalah pernyataan berikut dengan cermat sebelum menjawab pertanyaan tentang ${params.topic}.`;

    const correctIdx = i % 4;
    const base: Question = {
      number: i + 1,
      format: params.format,
      difficulty: diff,
      cognitive: cogKey,
      stem,
      context,
      visual,
      answer: "",
      explanation: `Jawaban yang tepat berkaitan dengan konsep inti pada ${params.topic} dalam ${params.subjectLabel}. Peserta didik perlu memahami prinsip utama, menerapkannya pada konteks soal, kemudian menyimpulkan jawaban yang paling sesuai dengan ${params.cognitiveLabel}.`,
    };

    switch (params.format) {
      case "pg": {
        const opts = makeOptions(i, correctIdx);
        base.options = opts;
        base.answer = opts[correctIdx].key;
        break;
      }
      case "pg-kompleks": {
        const opts = makeOptions(i, correctIdx);
        base.options = opts;
        base.answer = [opts[correctIdx].key, opts[(correctIdx + 2) % 5].key].join(", ");
        base.stem = base.stem + " (Pilih lebih dari satu jawaban yang benar)";
        break;
      }
      case "benar-salah": {
        base.options = [
          { key: "B", text: "Benar" },
          { key: "S", text: "Salah" },
        ];
        base.answer = i % 2 === 0 ? "B" : "S";
        break;
      }
      case "menjodohkan": {
        base.pairs = [
          { left: `Istilah ${i + 1}.A`, right: `Definisi tentang aspek pertama ${params.topic}` },
          { left: `Istilah ${i + 1}.B`, right: `Definisi tentang aspek kedua ${params.topic}` },
          { left: `Istilah ${i + 1}.C`, right: `Definisi tentang aspek ketiga ${params.topic}` },
          { left: `Istilah ${i + 1}.D`, right: `Definisi tentang aspek keempat ${params.topic}` },
        ];
        base.answer = "A→1, B→2, C→3, D→4";
        break;
      }
      case "isian": {
        base.stem = `Lengkapilah kalimat berikut: Konsep utama dari ${params.topic} pada ${params.subjectLabel} adalah ____.`;
        base.answer = `(Jawaban singkat terkait ${params.topic})`;
        break;
      }
      case "uraian": {
        base.answer = `Jawaban uraian yang ideal mencakup: (1) definisi ${params.topic}; (2) contoh konkret; (3) analisis berdasarkan ${params.cognitiveLabel}; dan (4) kesimpulan yang relevan dengan fase pembelajaran ${params.phaseLabel}.`;
        break;
      }
    }
    questions.push(base);
  }
  return questions;
}

// Simulate latency to feel like a real AI call
export function simulateLatency(count: number) {
  return new Promise((r) => setTimeout(r, 600 + count * 120));
}
