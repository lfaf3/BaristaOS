import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = createStorage();
Object.defineProperty(globalThis, "localStorage", { value: storage, configurable: true });

function createStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; }
  };
};

vi.mock("./http-client", () => ({
  apiRequest: vi.fn()
}));

import { apiRequest } from "./http-client";

describe("PaymentService.getTransactionLogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storage.clear();
  });

  it("returns local logs when the backend returns 401", async () => {
    const { PaymentService } = await import("./payment.service");
    const service = new PaymentService();
    const localLogs = [{ date: "03/08/2026", time: "10:00", sessionId: "local-1", provider: "Mock", amount: 10, status: "FINISHED", durationMs: 1000 }];
    localStorage.setItem("baristaos.payment.transactions.v1", JSON.stringify(localLogs));

    vi.mocked(apiRequest).mockRejectedValue({ response: { status: 401 } });

    const result = await service.getTransactionLogs();

    expect(result).toEqual(localLogs);
  });
});
