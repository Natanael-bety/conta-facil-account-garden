import { describe, expect, it } from "vitest";
import { accountTotal, addAccount, DEFAULT_GROUPS, removeAccount, type GroupId } from "@/lib/accounts";

describe("Editable account fields", () => {
  for (const group of ["income", "costs", "company", "others"] as GroupId[]) {
    it(`adds and removes fields in ${group} without changing other groups`, () => {
      const added = addAccount(DEFAULT_GROUPS, group, "new-field", "  Nova conta  ");
      expect(added[group]).toHaveLength(DEFAULT_GROUPS[group].length + 1);
      expect(added[group].at(-1)).toEqual({ id: "new-field", label: "Nova conta" });
      const removed = removeAccount(added, { "new-field": { 0: "100", 11: "200" }, salario: { 0: "1500" } }, group, "new-field");
      expect(removed.groups).toEqual(DEFAULT_GROUPS);
      expect(removed.data).toEqual({ salario: { 0: "1500" } });
    });
  }
  it("includes new income and cost fields in their totals", () => {
    const groups = addAccount(addAccount(DEFAULT_GROUPS, "income", "extra", "Extra"), "costs", "rent", "Aluguel");
    const data = { salario: { 0: "1500" }, extra: { 0: "100,50" }, rent: { 0: "200" }, cartaoPai: { 0: "66,50" } };
    expect(accountTotal(groups.income, data, 0)).toBe(1600.5);
    expect(accountTotal(groups.costs, data, 0)).toBe(200);
    expect(accountTotal(removeAccount(groups, data, "income", "salario").groups.income, data, 0)).toBe(100.5);
  });
  it("rejects an empty account name", () => {
    expect(addAccount(DEFAULT_GROUPS, "others", "empty", "  ")).toBe(DEFAULT_GROUPS);
  });
});