import type { Visual } from "../utils/generator";

export function VisualBlock({ visual }: { visual: Visual }) {
  return (
    <div className="my-4 overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/60 px-4 py-2.5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-indigo-100 text-indigo-600 text-[10px]">
            {visual.type === "chart" ? "📊" : visual.type === "table" ? "📋" : visual.type === "infographic" ? "💡" : "🖼️"}
          </span>
          {visual.title}
        </div>
        <span className="text-[10px] font-medium text-slate-400">stimulus</span>
      </div>
      <div className="p-4">
        {visual.type === "chart" && <ChartView visual={visual} />}
        {visual.type === "table" && <TableView visual={visual} />}
        {visual.type === "infographic" && <InfographicView visual={visual} />}
        {visual.type === "image" && <ImageView visual={visual} />}
      </div>
    </div>
  );
}

function ChartView({ visual }: { visual: Visual }) {
  const data = visual.data || [];
  const max = Math.max(...data.map((d) => d.value), 1);
  const kind = visual.chartKind || "bar";

  if (kind === "bar") {
    return (
      <div className="space-y-2">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-3">
            <div className="w-12 text-xs font-medium text-slate-600">{d.label}</div>
            <div className="flex-1 h-6 rounded-md bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 flex items-center justify-end px-2"
                style={{ width: `${(d.value / max) * 100}%` }}
              >
                <span className="text-[10px] font-semibold text-white">{d.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (kind === "line") {
    const w = 320;
    const h = 140;
    const pad = 24;
    const pts = data.map((d, i) => {
      const x = pad + (i * (w - pad * 2)) / Math.max(data.length - 1, 1);
      const y = h - pad - ((d.value / max) * (h - pad * 2));
      return { x, y, ...d };
    });
    const path = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
    return (
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-44">
        <defs>
          <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={pad} x2={w - pad} y1={pad + i * ((h - pad * 2) / 3)} y2={pad + i * ((h - pad * 2) / 3)} stroke="#e2e8f0" strokeWidth="1" />
        ))}
        <path d={`${path} L ${pts[pts.length - 1].x} ${h - pad} L ${pts[0].x} ${h - pad} Z`} fill="url(#lg)" />
        <path d={path} stroke="#6366f1" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="4" fill="#fff" stroke="#6366f1" strokeWidth="2" />
            <text x={p.x} y={h - 6} textAnchor="middle" className="fill-slate-500" fontSize="10">{p.label}</text>
          </g>
        ))}
      </svg>
    );
  }

  // pie
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981"];
  let cumulative = 0;
  const cx = 70, cy = 70, r = 60;
  const slices = data.map((d, i) => {
    const start = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    cumulative += d.value;
    const end = (cumulative / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = cx + r * Math.cos(start);
    const y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end);
    const y2 = cy + r * Math.sin(end);
    return { d: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`, color: colors[i % colors.length], label: d.label, value: d.value };
  });
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 140 140" className="w-32 h-32 flex-shrink-0">
        {slices.map((s, i) => <path key={i} d={s.d} fill={s.color} />)}
        <circle cx={cx} cy={cy} r={30} fill="#fff" />
      </svg>
      <div className="flex-1 space-y-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="h-3 w-3 rounded-sm" style={{ background: s.color }} />
            <span className="text-slate-700 font-medium">{s.label}</span>
            <span className="ml-auto text-slate-500">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableView({ visual }: { visual: Visual }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-100">
            {visual.headers?.map((h) => (
              <th key={h} className="px-3 py-2 text-left font-semibold text-slate-700 border-b border-slate-200">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visual.rows?.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}>
              {row.map((cell, j) => (
                <td key={j} className="px-3 py-2 border-b border-slate-100 text-slate-700">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfographicView({ visual }: { visual: Visual }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {visual.stats?.map((s, i) => (
        <div key={i} className="rounded-xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-3 text-center">
          <div className="text-2xl mb-1">{s.icon}</div>
          <div className="text-lg font-bold text-indigo-700">{s.value}</div>
          <div className="text-[11px] text-slate-600 mt-0.5">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

function ImageView({ visual }: { visual: Visual }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 border border-slate-200 py-8 px-4 text-center">
      <div className="text-6xl mb-3">{visual.emoji}</div>
      <p className="text-sm text-slate-600 max-w-md italic">{visual.caption}</p>
    </div>
  );
}
