import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, FileDown, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { DEFAULT_GROUPS, GROUP_TITLES, addAccount, removeAccount, accountTotal, type Row, type Data, type Groups, type GroupId } from "@/lib/accounts";

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

const KEY = "minhas-contas-v1";
const FIELDS_KEY = "minhas-contas-fields-v1";

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

const fmt = (n: number) => n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function Index() {
  const [data, setData] = useState<Data>(SEED);
  const [loaded, setLoaded] = useState(false);
  const [month, setMonth] = useState(0);
  const [groups, setGroups] = useState<Groups>(DEFAULT_GROUPS);
  const [adding, setAdding] = useState<GroupId | null>(null);
  const [name, setName] = useState("");
  const [removing, setRemoving] = useState<{ group: GroupId; row: Row } | null>(null);

  useEffect(() => {
    setMonth(new Date().getMonth());
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setData(JSON.parse(raw));
      const fields = localStorage.getItem(FIELDS_KEY);
      if (fields) {
        const saved = JSON.parse(fields);
        if (Object.keys(DEFAULT_GROUPS).every((key) => Array.isArray(saved[key]) && saved[key].every((row: Row) => typeof row.id === "string" && typeof row.label === "string"))) setGroups(saved);
      }
    } catch {
      // Keep the existing defaults if saved browser data is unreadable.
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(KEY, JSON.stringify(data));
      localStorage.setItem(FIELDS_KEY, JSON.stringify(groups));
    }
  }, [data, groups, loaded]);

  const set = (id: string, m: number, v: string) =>
    setData((d) => ({ ...d, [id]: { ...(d[id] || {}), [m]: v } }));
  const total = (m: number) => accountTotal(groups.costs, data, m);
  const income = (m: number) => accountTotal(groups.income, data, m);

  const renderRows = (groupId: GroupId) =>
    groups[groupId].map((r) => (
      <tr key={r.id}>
        <th className="sheet-label">
          <div className="flex items-center justify-between gap-2">
            <span className="min-w-0 break-words">{r.label}</span>
            <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 text-muted-foreground hover:text-destructive print:hidden" aria-label={`Remover ${r.label}`} title={`Remover ${r.label}`} onClick={() => setRemoving({ group: groupId, row: r })}><Trash2 className="h-4 w-4" /></Button>
          </div>
        </th>
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

  const group = (groupId: GroupId, cls = "") => (
    <tr className="sheet-group">
      <th className={`sheet-label ${cls}`}>
        <div className="flex items-center justify-between gap-2">
          <span>{GROUP_TITLES[groupId]}</span>
          <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 print:hidden" aria-label={`Adicionar campo em ${GROUP_TITLES[groupId]}`} title="Adicionar campo" onClick={() => { setName(""); setAdding(groupId); }}><Plus className="h-5 w-5" /></Button>
        </div>
      </th>
      {MONTHS.map((name) => <td key={name} className="sheet-cell" />)}
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
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-4 sm:px-6 print:border-0">
        <div className="flex min-w-0 items-center gap-3">
          <div className="h-9 w-9 shrink-0 rounded bg-primary text-primary-foreground grid place-items-center font-bold">R$</div>
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold text-foreground">Minhas Contas</h1>
            <p className="text-xs text-muted-foreground print:hidden">Salvo automaticamente neste navegador</p>
          </div>
        </div>
        <Button onClick={() => window.print()} aria-label="Exportar PDF" title="Exportar PDF" className="h-11 shrink-0 px-3 print:hidden">
          <FileDown aria-hidden="true" /><span className="hidden sm:inline">Exportar</span> PDF
        </Button>
      </header>

      <nav aria-label="Escolher mês" className="grid grid-cols-[44px_minmax(0,1fr)_44px] items-center gap-3 px-4 pt-4 sm:max-w-sm print:hidden">
        <Button variant="outline" size="icon" className="h-11 w-11" aria-label="Mês anterior" title="Mês anterior" disabled={month === 0} onClick={() => setMonth((m) => m - 1)}><ChevronLeft /></Button>
        <select aria-label="Mês" value={month} onChange={(e) => setMonth(Number(e.target.value))} className="h-11 min-w-0 rounded-md border border-input bg-card px-3 text-base font-semibold capitalize text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          {MONTHS.map((name, index) => <option key={name} value={index}>{name}</option>)}
        </select>
        <Button variant="outline" size="icon" className="h-11 w-11" aria-label="Próximo mês" title="Próximo mês" disabled={month === 11} onClick={() => setMonth((m) => m + 1)}><ChevronRight /></Button>
      </nav>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4">
        {[
          ["Entradas", income(month), "text-primary"],
          ["Gasto total", total(month), "text-section"],
          ["Saldo", income(month) - total(month), "text-foreground"],
        ].map(([l, v, c]) => (
          <div key={l as string} className={`min-w-0 rounded-md border border-border bg-card p-3 sm:p-4 ${l === "Saldo" ? "col-span-2 sm:col-span-1" : ""}`}>
            <p className="text-xs text-muted-foreground">{l} · {MONTHS[month]}</p>
            <p className={`mt-1 break-words text-xl sm:text-2xl font-semibold ${c}`}>R$ {fmt(v as number)}</p>
          </div>
        ))}
      </section>

      <div className="overflow-auto px-4 pb-8 print:overflow-visible">
        <table className="sheet" data-month={month}>
          <thead>
            <tr>
              <th className="sheet-label sheet-head">Conta</th>
              {MONTHS.map((m, i) => (
                <th key={m} className={`sheet-head capitalize ${i === month ? "bg-accent" : ""}`}>{m}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {group("income", "text-primary")}
            {renderRows("income")}
            {computed("total entradas", income, "text-primary")}
            {group("costs", "text-section")}
            {renderRows("costs")}
            {computed("gasto total", total)}
            {computed("saldo", (m) => income(m) - total(m))}
            {group("company", "text-section")}
            {renderRows("company")}
            {group("others")}
            {renderRows("others")}
          </tbody>
        </table>
      </div>
      <Dialog open={adding !== null} onOpenChange={(open) => { if (!open) setAdding(null); }}>
        <DialogContent className="max-w-[calc(100%-2rem)] rounded-md sm:max-w-md">
          <DialogHeader><DialogTitle>Adicionar campo</DialogTitle><DialogDescription>{adding ? GROUP_TITLES[adding] : ""}</DialogDescription></DialogHeader>
          <form className="grid gap-4" onSubmit={(event) => {
            event.preventDefault();
            if (!adding || !name.trim()) return;
            setGroups((current) => addAccount(current, adding, `custom-${crypto.randomUUID()}`, name));
            setAdding(null);
          }}>
            <div className="grid gap-2"><label htmlFor="account-name" className="text-sm font-medium">Nome do campo</label><Input id="account-name" autoFocus maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="h-11" /></div>
            <DialogFooter className="gap-2"><Button type="button" variant="outline" className="h-11" onClick={() => setAdding(null)}>Cancelar</Button><Button type="submit" className="h-11" disabled={!name.trim()}><Plus />Adicionar</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={removing !== null} onOpenChange={(open) => { if (!open) setRemoving(null); }}>
        <AlertDialogContent className="max-w-[calc(100%-2rem)] rounded-md sm:max-w-md">
          <AlertDialogHeader><AlertDialogTitle>Remover campo?</AlertDialogTitle><AlertDialogDescription>O campo “{removing?.row.label}” e seus valores de todos os meses serão removidos. Esta ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="gap-2"><AlertDialogCancel className="h-11">Cancelar</AlertDialogCancel><AlertDialogAction className="h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => {
            if (!removing) return;
            const next = removeAccount(groups, data, removing.group, removing.row.id);
            setGroups(next.groups);
            setData(next.data);
            setRemoving(null);
          }}><Trash2 />Remover</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
