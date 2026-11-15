import { describe, expect, it } from "vitest";
import { addEntries, parseAmounts } from "@/lib/account-entries";
import { accountTotal, DEFAULT_GROUPS } from "@/lib/accounts";

describe("Monthly additions and history", () => {
  it("sums multiple Brazilian numbers with exact cents", () => {
    expect(parseAmounts("100 + 25,50 + 1.000,10")).toEqual([10000, 2550, 100010]);
    const result = addEntries({}, {}, "salario", 10, [
      { id: "a", cents: 10, createdAt: "2026-11-15T00:14:00.000Z" },
      { id: "b", cents: 20, createdAt: "2026-11-15T00:14:00.000Z" },
    ]);
    expect(result.data["salario"]?.[10]).toBe("0,30");
    expect(accountTotal(DEFAULT_GROUPS.income, result.data, 10)).toBe(0.3);
  });
  it("preserves previous values and the exact date of each addition", () => {
    const first = addEntries({ salario: { 10: "1.500,00", 11: "200" } }, {}, "salario", 10, [{ id: "a", cents: 10000, createdAt: "2026-11-15T00:14:00.000Z" }]);
    const second = addEntries(first.data, first.history, "salario", 10, [{ id: "b", cents: 2550, createdAt: "2026-11-16T10:00:00.000Z" }]);
    expect(second.data["salario"]).toEqual({ 10: "1625,50", 11: "200" });
    expect(second.history["salario"]?.[10]).toEqual({ initialValue: "1.500,00", entries: [
      { id: "a", cents: 10000, createdAt: "2026-11-15T00:14:00.000Z" },
      { id: "b", cents: 2550, createdAt: "2026-11-16T10:00:00.000Z" },
    ] });
  });
  it("rejects malformed sums rather than executing expressions", () => {
    for (const input of ["", "100 +", "1,234", "10 * 5", "alert(1)", "1.5"]) expect(parseAmounts(input)).toBeNull();
  });
});