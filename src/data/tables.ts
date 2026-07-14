import type { CafeTable } from "../types";

export const initialTables: CafeTable[] = Array.from({ length: 16 }, (_, index) => {
  const number = index + 1;
  const values: Record<number, Partial<CafeTable>> = {
    2: { status: "open", amount: 42.5, minutes: 14, people: 2, items: 4 },
    5: { status: "payment", amount: 86.5, minutes: 39, people: 3, items: 7 },
    7: { status: "open", amount: 31, minutes: 8, people: 2, items: 3 },
    12: { status: "open", amount: 54, minutes: 22, people: 4, items: 5 }
  };

  return {
    number,
    status: "free",
    amount: 0,
    minutes: 0,
    people: 0,
    items: 0,
    ...values[number]
  } as CafeTable;
});
