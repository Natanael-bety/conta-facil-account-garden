import type { Data } from "@/lib/accounts";

export type Entry = { id: string; cents: number; createdAt: string };
export type CellHistory = { initialValue: string; entries: Entry[] };
export type AccountHistory = Record<string, Record<number, CellHistory>>;

// Accept Brazilian monetary values and + separated sums, without evaluating code.
export function parseAmounts(input: string): number[] | null {
  const parts = input.split("+").map((part) => part.trim());
  if (!parts.length || parts.some((part) => !/^(?:\d+|\d{1,3}(?:\.\d{3})+)(?:,\d{1,2})?$/.test(part))) return null;
  const amounts = parts.map((part) => {
    const [whole, fraction = ""] = part.replace(/\./g, "").split(",");
    return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  });
  return amounts.every((value) => Number.isSafeInteger(value)) ? amounts : null;
}

export function addEntries(data: Data, history: AccountHistory, rowId: string, month: number, entries: Entry[]) {
  const previous = history[rowId]?.[month] ?? { initialValue: data[rowId]?.[month] ?? "", entries: [] };
  const nextCell = { ...previous, entries: [...previous.entries, ...entries] };
  const initialCents = parseAmounts(previous.initialValue)?.[0] ?? 0;
  const total = nextCell.entries.reduce((sum, entry) => sum + entry.cents, initialCents);
  if (!Number.isSafeInteger(total)) throw new Error("O total é muito alto.");
  return {
    data: { ...data, [rowId]: { ...data[rowId], [month]: (total / 100).toFixed(2).replace(".", ",") } },
    history: { ...history, [rowId]: { ...history[rowId], [month]: nextCell } },
  };
}