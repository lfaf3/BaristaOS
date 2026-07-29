import { AlertCircle, CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";

export type ToastKind = "success" | "error" | "warning" | "info";

interface ToastInput {
  title?: string;
  message: string;
  kind?: ToastKind;
  duration?: number;
}

interface ToastItem extends Required<Pick<ToastInput, "message" | "kind">> {
  id: number;
  title?: string;
}

interface ToastContextValue {
  showToast: (input: ToastInput | string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: TriangleAlert,
  info: Info
};

const defaultTitles: Record<ToastKind, string> = {
  success: "Operação concluída",
  error: "Não foi possível concluir",
  warning: "Atenção",
  info: "Informação"
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);

  const showToast = useCallback((input: ToastInput | string) => {
    const normalized: ToastInput = typeof input === "string" ? { message: input } : input;
    const id = nextId.current++;
    const kind = normalized.kind ?? "info";
    const duration = normalized.duration ?? 4200;

    setToasts(current => [
      ...current.slice(-3),
      { id, message: normalized.message, title: normalized.title, kind }
    ]);

    window.setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  const value = useMemo<ToastContextValue>(() => ({
    showToast,
    success: (message, title) => showToast({ message, title, kind: "success" }),
    error: (message, title) => showToast({ message, title, kind: "error", duration: 6000 }),
    warning: (message, title) => showToast({ message, title, kind: "warning" }),
    info: (message, title) => showToast({ message, title, kind: "info" })
  }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-atomic="false">
        {toasts.map(toast => {
          const Icon = icons[toast.kind];
          return (
            <div className={`app-toast app-toast--${toast.kind}`} role={toast.kind === "error" ? "alert" : "status"} key={toast.id}>
              <div className="app-toast__icon"><Icon size={20} /></div>
              <div className="app-toast__content">
                <strong>{toast.title ?? defaultTitles[toast.kind]}</strong>
                <span>{toast.message}</span>
              </div>
              <button type="button" aria-label="Fechar mensagem" onClick={() => dismiss(toast.id)}>
                <X size={17} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast deve ser usado dentro de ToastProvider.");
  return context;
}
