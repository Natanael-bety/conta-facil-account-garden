import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Minhas Contas — Controle mensal" },
      { name: "description", content: "Planilha de gerenciamento de contas pessoais e da empresa, mês a mês." },
      { property: "og:title", content: "Minhas Contas — Controle mensal" },
      { property: "og:description", content: "Controle salário, despesas, cartão, investimentos e renda da empresa." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

type Row = { id: string; label: string };
const EU_INCOME: Row[] = [
  { id: "salario", label: "salário" },
  { id: "caixa", label: "caixa nu" },
  { id: "entrada", label: "valor de entrada" },
  { id: "lanche", label: "Lanche" },
];
const EU_COSTS: Row[] = [
  { id: "despesa", label: "despesa" },
  { id: "cartaoPai", label: "Cartão de pai" },
  { id: "cartao", label: "cartão de credito" },
  { id: "consorcio", label: "consórcio" },
  { id: "internet", label: "internet" },
  { id: "movel", label: "internet móvel" },
];
const EMPRESA: Row[] = [
  { id: "investimentos", label: "investimentos" },
  { id: "renda", label: "renda bruta" },
];
const OUTROS: Row[] = [
  { id: "suely", label: "suely" },
  { id: "paula", label: "paula" },
];
const TOTAL_ROWS = ["despesa", "cartao", "consorcio", "internet", "movel"];

type Data = Record<string, Record<number, string>>;
const KEY = "minhas-contas-v1";

const SEED: Data = {
  salario: { 4: "1500", 5: "1500", 6: "1500", 7: "1500", 8: "1500", 9: "1500", 10: "1500", 11: "1500" },
  caixa: { 4: "100", 5: "1000", 6: "1000", 7: "250", 8: "250", 9: "250", 10: "250", 11: "250" },
  lanche: { 8: "188", 9: "111" },
  despesa: { 4: "739,31", 5: "1272,35", 6: "806", 7: "948,4", 8: "800", 9: "439,69" },
  cartaoPai: { 9: "66,5" },
  cartao: { 4: "317", 5: "505,15", 6: "423,8", 7: "435,75", 8: "453,75", 9: "424,2", 10: "441,14" },
  consorcio: { 4: "195", 5: "201,5", 6: "197,73", 7: "197,73", 8: "197,73", 9: "197,73", 10: "197,73" },
  internet: { 4: "25", 5: "25", 6: "25", 7: "25", 8: "25", 9: "25", 10: "65", 11: "65" },
  movel: { 4: "20", 5: "40", 6: "20", 7: "40", 8: "20", 9: "40" },
  investimentos: { 4: "492,15", 5: "232,6", 6: "300", 7: "573,6", 8: "260", 9: "859,69", 10: "85,5", 11: "85,5" },
  renda: { 4: "3116", 5: "1494", 6: "1960", 7: "2655", 8: "3060", 9: "3425" },
  suely: { 6: "150", 7: "239,79", 8: "239,79", 9: "89,79", 10: "87", 11: "87" },
  paula: { 4: "101", 5: "120", 6: "173,9", 7: "173,9", 8: "173,9", 9: "102", 10: "101", 11: "102" },
};

const num = (s?: string) => {
  if (!s) return 0;
  const n = parseFloat(s.replace(/\./g, "").replace(",", "."));
  return isNaN(n) ? 0 : n;
};
const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Index() {
  const [data, setData] = useState<Data>(SEED);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(KEY);
    if (raw) setData(JSON.parse(raw));
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(data));
  }, [data, loaded]);

  const set = (id: string, m: number, v: string) =>
    setData((d) => ({ ...d, [id]: { ...(d[id] || {}), [m]: v } }));
  const total = (m: number) => TOTAL_ROWS.reduce((s, id) => s + num(data[id]?.[m]), 0);
  const income = (m: number) => EU_INCOME.reduce((s, r) => s + num(data[r.id]?.[m]), 0);

  const renderRows = (rows: Row[]) =>
    rows.map((r) => (
      <tr key={r.id}>
        <th className="sheet-label">{r.label}</th>
        {MONTHS.map((_, m) => (
          <td key={m} className="sheet-cell">
            <input
              inputMode="decimal"
              value={data[r.id]?.[m] ?? ""}
              onChange={(e) => set(r.id, m, e.target.value)}
              className="sheet-input"
              aria-label={`${r.label} ${MONTHS[m]}`}
            />
          </td>
        ))}
      </tr>
    ));

  const section = (title: string) => (
    <tr>
      <th className="sheet-label text-section font-semibold">{title}</th>
      {MONTHS.map((_, m) => (
        <td key={m} className="sheet-cell px-2 text-section font-semibold">{title}</td>
      ))}
    </tr>
  );

  const now = new Date().getMonth();

  const group = (title: string, cls = "") => (
    <tr className="sheet-group">
      <th className={`sheet-label ${cls}`}>{title}</th>
      <td colSpan={12} className="sheet-cell" />
    </tr>
  );
  const computed = (label: string, fn: (m: number) => number, cls = "") => (
    <tr className="bg-muted">
      <th className={`sheet-label bg-muted font-semibold ${cls}`}>{label}</th>
      {MONTHS.map((_, m) => {
        const v = fn(m);
        return <td key={m} className={`sheet-cell px-2 text-right font-semibold ${cls} ${v < 0 ? "text-section" : ""}`}>{v ? fmt(v) : ""}</td>;
      })}
    </tr>
  );

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-6 py-4 flex flex-wrap items-center justify-between gap-4 print:border-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded bg-primary text-primary-foreground grid place-items-center font-bold">R$</div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">Minhas Contas</h1>
            <p className="text-xs text-muted-foreground print:hidden">Salvo automaticamente neste navegador</p>
          </div>
        </div>
        <button onClick={() => window.print()} className="print:hidden rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Exportar PDF
        </button>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
        {[
          ["Entradas", income(now), "text-primary"],
          ["Gasto total", total(now), "text-section"],
          ["Saldo", income(now) - total(now), "text-foreground"],
        ].map(([l, v, c]) => (
          <div key={l as string} className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{l} · {MONTHS[now]}</p>
            <p className={`mt-1 text-2xl font-semibold ${c}`}>R$ {fmt(v as number)}</p>
          </div>
        ))}
      </section>

      <div className="overflow-auto px-4 pb-8 print:overflow-visible">
        <table className="sheet">
          <thead>
            <tr>
              <th className="sheet-label sheet-head">Conta</th>
              {MONTHS.map((m, i) => (
                <th key={m} className={`sheet-head capitalize ${i === now ? "bg-accent" : ""}`}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group("EU — Entradas", "text-primary")}
            {renderRows(EU_INCOME)}
            {computed("total entradas", income, "text-primary")}
            {group("EU — Gastos", "text-section")}
            {renderRows(EU_COSTS)}
            {computed("gasto total", total)}
            {computed("saldo", (m) => income(m) - total(m))}
            {group("EMPRESA", "text-section")}
            {renderRows(EMPRESA)}
            {group("Outros")}
            {renderRows(OUTROS)}
          </tbody>
        </table>
      </div>
    </main>
  );
}
