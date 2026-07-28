import type { OrderHistoryDetail, HistoryPaymentMethod } from "../services/api/order-history.service";
import { formatCurrency } from "../utils/currency";

interface ReceiptPrintProps {
  order: OrderHistoryDetail;
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(new Date(value));
}

function paymentLabel(method: HistoryPaymentMethod) {
  const labels: Record<HistoryPaymentMethod, string> = {
    CASH: "Dinheiro",
    PIX: "PIX",
    TEF_CREDIT: "Crédito",
    TEF_DEBIT: "Débito",
    COURTESY: "Cortesia"
  };
  return labels[method];
}

export function ReceiptPrint({ order }: ReceiptPrintProps) {
  return (
    <article className="receipt" aria-label="Pré-visualização da comanda">
      <header className="receipt__header">
        <img
          className="receipt__logo"
          src="/brands/dm-caffe-sidebar-logo.png"
          alt="DM CAFFÈ"
        />
        <strong>DM CAFFÈ</strong>
        <span>Comprovante de venda</span>
      </header>

      <div className="receipt__divider" />

      <dl className="receipt__meta">
        <div><dt>Atendimento</dt><dd>{order.table ? (order.table.name ?? `Mesa ${order.table.number}`) : "Balcão"}</dd></div>
        <div><dt>Operador</dt><dd>{order.operator.name}</dd></div>
        <div><dt>Abertura</dt><dd>{formatDateTime(order.openedAt)}</dd></div>
        <div><dt>Fechamento</dt><dd>{formatDateTime(order.closedAt)}</dd></div>
        {order.guestCount > 0 && <div><dt>Pessoas</dt><dd>{order.guestCount}</dd></div>}
      </dl>

      <div className="receipt__divider" />

      <section className="receipt__section">
        <h3>Itens</h3>
        {order.items.map(item => (
          <div className="receipt__item" key={item.id}>
            <div className="receipt__item-line">
              <span>{item.quantity}× {item.name}</span>
              <b>{formatCurrency(item.totalPrice)}</b>
            </div>
            <small>{formatCurrency(item.unitPrice)} cada</small>
            {item.notes && <small className="receipt__note">Obs.: {item.notes}</small>}
          </div>
        ))}
      </section>

      <div className="receipt__divider" />

      <section className="receipt__totals" aria-label="Totais">
        <div><span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span></div>
        {order.discount > 0 && <div><span>Desconto</span><span>− {formatCurrency(order.discount)}</span></div>}
        {order.serviceCharge > 0 && (
          <div>
            <span>Serviço ({order.serviceChargePercentage}%)</span>
            <span>{formatCurrency(order.serviceCharge)}</span>
          </div>
        )}
        <div className="receipt__grand-total"><strong>Total</strong><strong>{formatCurrency(order.total)}</strong></div>
      </section>

      <div className="receipt__divider" />

      <section className="receipt__section">
        <h3>Pagamentos</h3>
        {order.payments.map(payment => (
          <div className="receipt__payment" key={payment.id}>
            <span>{paymentLabel(payment.method)}</span>
            <b>{formatCurrency(payment.amount)}</b>
          </div>
        ))}
      </section>

      {order.notes && (
        <>
          <div className="receipt__divider" />
          <p className="receipt__order-note"><b>Observação:</b> {order.notes}</p>
        </>
      )}

      <footer className="receipt__footer">
        <div className="receipt__divider" />
        <strong>Obrigado pela preferência!</strong>
        <span>BaristaOS</span>
      </footer>
    </article>
  );
}
