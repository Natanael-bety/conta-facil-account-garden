export type Row = { id: string; label: string; excludedFromTotal?: boolean };
export type GroupId = "income" | "costs" | "company" | "others";
export type Groups = Record<GroupId, Row[]>;
export type Data = Record<string, Record<number, string>>;

export const DEFAULT_GROUPS: Groups = {
  income: [
    { id: "salario", label: "salário" },
    { id: "caixa", label: "caixa nu" },
    { id: "entrada", label: "valor de entrada" },
    { id: "lanche", label: "Lanche" },
  ],
  costs: [
    { id: "despesa", label: "despesa" },
    { id: "cartaoPai", label: "Cartão de pai", excludedFromTotal: true },
    { id: "cartao", label: "cartão de credito" },
    { id: "consorcio", label: "consórcio" },
    { id: "internet", label: "internet" },
    { id: "movel", label: "internet móvel" },
  ],
  company: [{ id: "investimentos", label: "investimentos" }, { id: "renda", label: "renda bruta" }],
  others: [{ id: "suely", label: "suely" }, { id: "paula", label: "paula" }],
};

export const GROUP_TITLES: Record<GroupId, string> = {
  income: "EU — Entradas", costs: "EU — Gastos", company: "EMPRESA", others: "Outros",
};

export function addAccount(groups: Groups, group: GroupId, id: string, label: string): Groups {
  const name = label.trim();
  if (!name) return groups;
  return { ...groups, [group]: [...groups[group], { id, label: name }] };
}

export function removeAccount(groups: Groups, data: Data, group: GroupId, id: string) {
  const remaining = { ...data };
  delete remaining[id];
  return { groups: { ...groups, [group]: groups[group].filter((row) => row.id !== id) }, data: remaining };
}

export function accountTotal(rows: Row[], data: Data, month: number) {
  return rows.reduce((sum, row) => {
    if (row.excludedFromTotal) return sum;
    const value = parseFloat((data[row.id]?.[month] ?? "").replace(/\./g, "").replace(",", "."));
    return sum + (Number.isNaN(value) ? 0 : value);
  }, 0);
}