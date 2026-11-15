import { useState } from "react";
import { History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { parseAmounts, type CellHistory } from "@/lib/account-entries";

const money = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export function AccountEntryDialog({ label, month, value, history, onClose, onAdd }: {
  label: string; month: string; value: string; history: CellHistory | undefined;
  onClose: () => void; onAdd: (amounts: number[]) => string | null;
}) {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const initial = history?.initialValue ?? value;
  const amounts = parseAmounts(input);
  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-h-[85dvh] max-w-[calc(100%-2rem)] overflow-y-auto rounded-md p-5 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="break-words pr-5">{label}</DialogTitle>
          <DialogDescription className="capitalize">{month}</DialogDescription>
        </DialogHeader>
        <div className="border-b border-border pb-4">
          <p className="text-sm text-muted-foreground">Total do campo</p>
          <p className="mt-1 break-words text-2xl font-semibold text-primary">{money(parseAmounts(value)?.[0] ?? 0)}</p>
        </div>
        <form className="grid gap-3" onSubmit={(event) => {
          event.preventDefault();
          if (!amounts) { setError("Digite valores como 100 + 25,50."); return; }
          const failure = onAdd(amounts);
          setError(failure);
          if (!failure) setInput("");
        }}>
          <label htmlFor="entry-amount" className="text-sm font-medium">Adicionar valores</label>
          <Input id="entry-amount" autoFocus value={input} placeholder="100 + 25,50" className="h-11 text-base" aria-invalid={Boolean(error)} aria-describedby={error ? "entry-error" : undefined} onChange={(event) => { setInput(event.target.value); setError(null); }} />
          {error && <p id="entry-error" role="alert" className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="h-11" disabled={!input.trim()}><Plus />Adicionar{amounts ? ` ${money(amounts.reduce((sum, amount) => sum + amount, 0))}` : ""}</Button>
        </form>
        <section className="min-w-0 border-t border-border pt-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><History className="h-4 w-4" />Histórico</h2>
          <ul className="divide-y divide-border">
            {[...(history?.entries ?? [])].reverse().map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <time dateTime={entry.createdAt} className="text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })}</time>
                <span className="break-all text-sm font-semibold">+ {money(entry.cents)}</span>
              </li>
            ))}
            {initial && <li className="flex flex-wrap items-center justify-between gap-2 py-3"><div className="text-xs text-muted-foreground">Valor anterior<p>Data não registrada</p></div><span className="text-sm font-semibold">{money(parseAmounts(initial)?.[0] ?? 0)}</span></li>}
          </ul>
          {!initial && !history?.entries.length && <p className="py-3 text-sm text-muted-foreground">Nenhum lançamento ainda.</p>}
        </section>
      </DialogContent>
    </Dialog>
  );
}