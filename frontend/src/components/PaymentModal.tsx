import { Check, LoaderCircle, Printer, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "../app/AppContext";
import { formatCurrency } from "../utils/currency";

type Stage = "confirm" | "tef" | "approved" | "receipt";

interface Props {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function PaymentModal({ open, onClose, onComplete }: Props) {
  const { cart, paymentMethod, subtotal, selectedTable, counterSale } = useApp();
  const [stage, setStage] = useState<Stage>("confirm");

  useEffect(() => {
    if (!open) return;
    setStage(paymentMethod === "TEF" ? "tef" : "confirm");

    if (paymentMethod === "TEF") {
      const timer = window.setTimeout(() => setStage("approved"), 2200);
      return () => window.clearTimeout(timer);
    }
  }, [open, paymentMethod]);

  const contextLabel = counterSale
    ? "Balcão"
    : selectedTable
      ? `Mesa ${String(selectedTable).padStart(2, "0")}`
      : "Venda";

  const receipt = useMemo(() => {
    const lines = cart
      .map(item => `${String(item.quantity).padStart(2, "0")}x ${item.name} — ${formatCurrency(item.price * item.quantity)}`)
      .join("\n");

    return `DM CAFFÈ
BARISTAOS FRONTEND v1.0
----------------------------------------
${contextLabel}
Operador: Diego
Pagamento: ${paymentMethod}
----------------------------------------
${lines}
----------------------------------------
TOTAL: ${formatCurrency(subtotal)}
----------------------------------------
Obrigado pela preferência!`;
  }, [cart, contextLabel, paymentMethod, subtotal]);

  if (!open) return null;

  function finishReceipt() {
    onComplete();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <div className="modal-card__header">
          <div>
            <span className="eyebrow">Fechamento</span>
            <h2>
              {stage === "tef" && "Cartão via TEF"}
              {stage === "approved" && "Pagamento aprovado"}
              {stage === "receipt" && "Venda concluída"}
              {stage === "confirm" && `Pagamento em ${paymentMethod}`}
            </h2>
          </div>
          <button className="icon-button" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-card__body">
          {stage === "confirm" && (
            <div className="payment-confirmation">
              <span>Total a receber</span>
              <strong>{formatCurrency(subtotal)}</strong>
              <p>Confirme o recebimento para concluir a venda de <b>{contextLabel}</b>.</p>
            </div>
          )}

          {stage === "tef" && (
            <div className="tef-state">
              <LoaderCircle className="spinner" size={58} />
              <h3>Processando no PinPad</h3>
              <p>Insira, aproxime ou passe o cartão.</p>
            </div>
          )}

          {stage === "approved" && (
            <div className="tef-state">
              <div className="approved-icon"><Check size={36} /></div>
              <h3>Pagamento aprovado</h3>
              <p>NSU 483920 · Autorização 914286</p>
            </div>
          )}

          {stage === "receipt" && <pre className="receipt">{receipt}</pre>}
        </div>

        <div className="modal-card__actions">
          {stage === "confirm" && (
            <>
              <button className="button button--soft" onClick={onClose}>Voltar</button>
              <button className="button button--success" onClick={() => setStage("receipt")}>Confirmar recebimento</button>
            </>
          )}

          {stage === "approved" && (
            <button className="button button--success" onClick={() => setStage("receipt")}>Concluir venda</button>
          )}

          {stage === "receipt" && (
            <>
              <button className="button button--soft" onClick={() => window.print()}><Printer size={17} /> Imprimir</button>
              <button className="button button--primary" onClick={finishReceipt}>Voltar às mesas</button>
            </>
          )}

          {stage === "tef" && (
            <button className="button button--danger" onClick={onClose}>Cancelar operação</button>
          )}
        </div>
      </div>
    </div>
  );
}
