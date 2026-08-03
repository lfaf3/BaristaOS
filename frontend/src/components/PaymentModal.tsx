import { RotateCcw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../app/AppContext";
import { paymentService, type PaymentResponse } from "../services/api/payment.service";
import { PaymentProgress } from "./PaymentProgress";

interface Props {
  open: boolean;
  response: PaymentResponse | null;
  onProgress: (response: PaymentResponse) => void;
  onClose: () => void;
  onRetry: () => Promise<void>;
  onComplete: () => void;
}

export function PaymentModal({ open, response, onProgress, onClose, onRetry, onComplete }: Props) {
  const { cart, paymentMethod, subtotal, selectedTable, counterSale } = useApp();
  const [advancing, setAdvancing] = useState(false);
  const authorized = response?.status === "AUTHORIZED";
  const failed = response ? ["FAILED", "CANCELLED", "TIMEOUT", "COMMUNICATION_ERROR"].includes(response.status) : false;
  const busy = Boolean(response && ["CREATED", "WAITING_DEVICE", "CARD_INSERTED", "PROCESSING", "CONFIRMED"].includes(response.status));

  const contextLabel = counterSale ? "Balcão" : selectedTable ? `Mesa ${String(selectedTable).padStart(2, "0")}` : "Venda";
  const receipt = useMemo(() => ({
    context: contextLabel,
    paymentMethod,
    total: subtotal,
    items: cart.map(item => ({ name: item.name, quantity: item.quantity, total: item.price * item.quantity }))
  }), [cart, contextLabel, paymentMethod, subtotal]);

  useEffect(() => {
    if (open && authorized && paymentService.getSettings().autoConfirm && !advancing) void confirmSale();
  }, [open, authorized, advancing, response?.transactionId]);

  useEffect(() => { if (!open) setAdvancing(false); }, [open]);

  if (!open || !response) return null;

  async function confirmSale() {
    if (!response || response.status !== "AUTHORIZED" || advancing) return;
    setAdvancing(true);
    const confirmed = await paymentService.confirmPayment(response.transactionId, onProgress);
    if (confirmed.status !== "CONFIRMED") {
      setAdvancing(false);
      return;
    }

    // v3.5.0: emitir NFC-e, armazenar XML e imprimir DANFE neste ponto.
    // Se a venda falhar após a emissão, cancelar via FiscalIntegrationService.
    console.info("[PaymentReceiptPlaceholder]", { ...receipt, payment: confirmed });
    const finished = await paymentService.finishTransaction(response.transactionId, onProgress);
    if (finished.status === "FINISHED") window.setTimeout(onComplete, 650);
  }

  async function cancelSale() {
    if (!response) return;
    await paymentService.cancelPayment(response.transactionId, onProgress);
    onClose();
  }

  return (
    <div className="modal-backdrop payment-modal-backdrop" role="dialog" aria-modal="true" aria-live="polite">
      <div className="modal-card payment-flow-modal">
        <div className="modal-card__header">
          <div><span className="eyebrow">Pagamento</span><h2>{response.message}</h2></div>
          {!busy && !advancing && failed && <button className="icon-button" onClick={() => void cancelSale()} aria-label="Cancelar venda"><X size={18} /></button>}
        </div>

        <div className="modal-card__body">
          <PaymentProgress
            status={response.status}
            message={response.message}
            provider={response.provider}
            authorizationCode={response.authorizationCode}
            session={response.session}
          />
          {failed && <small>A estrutura aceita negação, cancelamento, timeout e perda de comunicação.</small>}
        </div>

        <div className="modal-card__actions">
          {authorized && <button className="button button--success" disabled={advancing} onClick={() => void confirmSale()}>OK</button>}
          {failed && <><button className="button button--soft" onClick={() => void cancelSale()}>Cancelar venda</button><button className="button button--primary" onClick={() => void onRetry()}><RotateCcw size={17} /> Tentar novamente</button></>}
        </div>
      </div>
    </div>
  );
}
