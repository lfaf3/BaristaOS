import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useApp } from "../app/AppContext";
import { formatCurrency } from "../utils/currency";
import type { PaymentMethod } from "../types";

interface Props {
  onFinish: () => void;
}

export function CartPanel({ onFinish }: Props) {
  const {
    cart,
    changeQuantity,
    clearCart,
    paymentMethod,
    setPaymentMethod,
    subtotal,
    itemCount
  } = useApp();

  const methods: PaymentMethod[] = ["Dinheiro", "PIX", "TEF"];

  return (
    <aside className="cart-panel">
      <div className="cart-panel__header">
        <div>
          <span className="eyebrow">Comanda</span>
          <h2>Pedido atual</h2>
        </div>
        <button className="icon-button" onClick={clearCart} title="Limpar pedido">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="cart-panel__items">
        {cart.length === 0 ? (
          <div className="empty-state">
            <ShoppingBag size={40} strokeWidth={1.5} />
            <strong>Pedido vazio</strong>
            <span>Selecione um produto para começar.</span>
          </div>
        ) : (
          cart.map(item => (
            <div className="cart-item" key={item.id}>
              <div>
                <strong>{item.name}</strong>
                <small>{item.code} · {formatCurrency(item.price)} cada</small>
                <div className="quantity-control">
                  <button onClick={() => changeQuantity(item.id, -1)}><Minus size={14} /></button>
                  <span>{item.quantity}</span>
                  <button onClick={() => changeQuantity(item.id, 1)}><Plus size={14} /></button>
                </div>
              </div>
              <strong>{formatCurrency(item.price * item.quantity)}</strong>
            </div>
          ))
        )}
      </div>

      <div className="cart-panel__summary">
        <div className="summary-row"><span>Itens</span><strong>{itemCount}</strong></div>
        <div className="summary-row"><span>Subtotal</span><strong>{formatCurrency(subtotal)}</strong></div>
        <div className="summary-total"><span>Total</span><strong>{formatCurrency(subtotal)}</strong></div>

        <div className="payment-methods">
          {methods.map(method => (
            <button
              key={method}
              className={paymentMethod === method ? "payment-chip payment-chip--active" : "payment-chip"}
              onClick={() => setPaymentMethod(method)}
            >
              {method}
            </button>
          ))}
        </div>

        <button className="button button--accent button--large" onClick={onFinish}>
          Finalizar venda <span>F9</span>
        </button>
      </div>
    </aside>
  );
}
