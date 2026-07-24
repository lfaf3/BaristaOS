import { Plus, RefreshCw, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { formatCurrency } from "../utils/currency";

export type OrderPaymentMethod = "CASH" | "PIX" | "TEF_CREDIT" | "TEF_DEBIT" | "COURTESY";

type DraftPayment = {
  id: string;
  method: OrderPaymentMethod;
  amount: string;
};

interface Props {
  open: boolean;
  total: number;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (payments: Array<{ method: OrderPaymentMethod; amount: number }>) => void;
}

const methodLabels: Record<OrderPaymentMethod, string> = {
  CASH: "Dinheiro",
  PIX: "PIX",
  TEF_CREDIT: "Crédito",
  TEF_DEBIT: "Débito",
  COURTESY: "Cortesia"
};

function parseMoney(value: string) {
  const parsed = Number(value.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
}

function moneyInput(value: number) {
  return value.toFixed(2).replace(".", ",");
}

export function TablePaymentModal({ open, total, submitting, error, onClose, onConfirm }: Props) {
  const [payments, setPayments] = useState<DraftPayment[]>([]);

  useEffect(() => {
    if (!open) return;
    setPayments([{ id: crypto.randomUUID(), method: "PIX", amount: moneyInput(total) }]);
  }, [open, total]);

  const paid = useMemo(
    () => Math.round(payments.reduce((sum, payment) => sum + parseMoney(payment.amount), 0) * 100) / 100,
    [payments]
  );
  const balance = Math.round((total - paid) * 100) / 100;
  const valid = payments.length > 0 && payments.every(payment => parseMoney(payment.amount) > 0) && balance === 0;

  if (!open) return null;

  function updatePayment(id: string, patch: Partial<DraftPayment>) {
    setPayments(current => current.map(payment => payment.id === id ? { ...payment, ...patch } : payment));
  }

  function addPayment() {
    if (submitting || payments.length >= 10) return;

    setPayments(current => {
      const currentPaid = Math.round(
        current.reduce((sum, payment) => sum + parseMoney(payment.amount), 0) * 100
      ) / 100;
      const currentBalance = Math.round((total - currentPaid) * 100) / 100;

      if (currentBalance > 0) {
        return [
          ...current,
          { id: crypto.randomUUID(), method: "CASH", amount: moneyInput(currentBalance) }
        ];
      }

      // Quando a primeira forma já contém o total inteiro, divide a maior
      // parcela para abrir espaço para uma segunda forma de pagamento.
      const largestIndex = current.reduce(
        (largest, payment, index, list) =>
          parseMoney(payment.amount) > parseMoney(list[largest]?.amount ?? "0") ? index : largest,
        0
      );
      const largestAmountInCents = Math.round(parseMoney(current[largestIndex]?.amount ?? "0") * 100);

      if (largestAmountInCents < 2) return current;

      const newPaymentInCents = Math.floor(largestAmountInCents / 2);
      const remainingInCents = largestAmountInCents - newPaymentInCents;

      return [
        ...current.map((payment, index) =>
          index === largestIndex
            ? { ...payment, amount: moneyInput(remainingInCents / 100) }
            : payment
        ),
        {
          id: crypto.randomUUID(),
          method: "CASH",
          amount: moneyInput(newPaymentInCents / 100)
        }
      ];
    });
  }

  function removePayment(id: string) {
    setPayments(current => current.filter(payment => payment.id !== id));
  }

  function submit() {
    if (!valid || submitting) return;
    onConfirm(payments.map(payment => ({ method: payment.method, amount: parseMoney(payment.amount) })));
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-card table-payment-modal">
        <div className="modal-card__header">
          <div>
            <span className="eyebrow">Recebimento</span>
            <h2>Registrar pagamento</h2>
          </div>
          <button className="icon-button" onClick={onClose} disabled={submitting}><X size={18} /></button>
        </div>

        <div className="modal-card__body">
          <div className="payment-total-highlight">
            <span>Total da conta</span>
            <strong>{formatCurrency(total)}</strong>
          </div>

          <div className="table-payment-rows">
            {payments.map((payment, index) => (
              <div className="table-payment-row" key={payment.id}>
                <label>
                  <span>Forma {payments.length > 1 ? index + 1 : ""}</span>
                  <select
                    value={payment.method}
                    disabled={submitting}
                    onChange={event => updatePayment(payment.id, { method: event.target.value as OrderPaymentMethod })}
                  >
                    {Object.entries(methodLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Valor</span>
                  <input
                    inputMode="decimal"
                    value={payment.amount}
                    disabled={submitting}
                    onChange={event => updatePayment(payment.id, { amount: event.target.value })}
                    onBlur={() => updatePayment(payment.id, { amount: moneyInput(parseMoney(payment.amount)) })}
                  />
                </label>
                {payments.length > 1 && (
                  <button
                    className="order-remove-button table-payment-remove"
                    onClick={() => removePayment(payment.id)}
                    disabled={submitting}
                  >
                    <Trash2 size={16} /> Remover
                  </button>
                )}
              </div>
            ))}
          </div>

          <button
            className="button button--soft table-payment-add"
            onClick={addPayment}
            disabled={submitting || payments.length >= 10 || total <= 0}
          >
            <Plus size={17} /> Adicionar outra forma
          </button>

          <dl className="payment-balance-summary">
            <div><dt>Informado</dt><dd>{formatCurrency(paid)}</dd></div>
            <div className={balance !== 0 ? "payment-balance-summary--pending" : ""}>
              <dt>Saldo</dt><dd>{formatCurrency(Math.abs(balance))}{balance < 0 ? " excedente" : ""}</dd>
            </div>
          </dl>

          {error && <div className="tables-action-error" role="alert"><span>{error}</span></div>}
        </div>

        <div className="modal-card__actions">
          <button className="button button--soft" onClick={onClose} disabled={submitting}>Cancelar</button>
          <button className="button button--success" onClick={submit} disabled={!valid || submitting}>
            {submitting && <RefreshCw size={17} className="icon-spin" />}
            {submitting ? "Registrando..." : "Confirmar pagamento"}
          </button>
        </div>
      </div>
    </div>
  );
}
