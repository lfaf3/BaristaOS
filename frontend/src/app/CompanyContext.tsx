import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { companyService, type CompanySettings } from "../services/api/company.service";
import { useAuth } from "./AuthContext";

interface CompanyContextValue {
  company: CompanySettings | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setCompany: (company: CompanySettings) => void;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [company, setCompany] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") return;
    setLoading(true);
    try { setCompany(await companyService.get()); }
    catch { setCompany(null); }
    finally { setLoading(false); }
  }, [status]);

  useEffect(() => {
    if (status === "authenticated") void refresh();
    else setCompany(null);
  }, [status, refresh]);

  useEffect(() => {
    const color = company?.primaryColor ?? "#3F2C27";

    const darkenHex = (hex: string, amount = 0.2) => {
      const normalized = hex.replace("#", "");
      if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) return "#2D211E";

      const channels = [0, 2, 4].map(index =>
        Math.max(0, Math.round(parseInt(normalized.slice(index, index + 2), 16) * (1 - amount)))
      );

      return `#${channels.map(channel => channel.toString(16).padStart(2, "0")).join("")}`;
    };

    const root = document.documentElement;
    root.style.setProperty("--brand-primary", color);
    root.style.setProperty("--primary", color);
    root.style.setProperty("--espresso", color);
    root.style.setProperty("--espresso-dark", darkenHex(color));
    root.style.setProperty("--shadow", `0 14px 40px color-mix(in srgb, ${color} 18%, transparent)`);
  }, [company?.primaryColor]);

  const value = useMemo(() => ({ company, loading, refresh, setCompany }), [company, loading, refresh]);
  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const value = useContext(CompanyContext);
  if (!value) throw new Error("useCompany deve ser usado dentro de CompanyProvider.");
  return value;
}
