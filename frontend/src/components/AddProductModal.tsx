import { Minus, Plus, Search, ShoppingCart, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { normalizeApiError } from "../services/api/api-error";
import { productsService, type OrderProduct } from "../services/api/products.service";
import { formatCurrency } from "../utils/currency";

interface AddProductModalProps {
  open: boolean;
  submitting: boolean;
  submitError: string | null;
  onClose: () => void;
  onConfirm: (input: { productId: string; quantity: number }) => Promise<void>;
}

export function AddProductModal({ open, submitting, submitError, onClose, onConfirm }: AddProductModalProps) {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [selected, setSelected] = useState<OrderProduct | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let active = true;
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await productsService.list(query.trim());
        if (active) setProducts(response.data);
      } catch (cause) {
        if (active) setError(normalizeApiError(cause).message);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelected(null);
      setQuantity(1);
      setError(null);
    }
  }, [open]);

  const itemTotal = useMemo(
    () => (selected ? selected.price * quantity : 0),
    [selected, quantity]
  );

  if (!open) return null;

  async function handleConfirm() {
    if (!selected || submitting) return;
    await onConfirm({ productId: selected.id, quantity });
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget && !submitting) onClose();
    }}>
      <section className="product-modal" role="dialog" aria-modal="true" aria-labelledby="add-product-title">
        <header className="product-modal__header">
          <div>
            <span className="eyebrow">Comanda da mesa</span>
            <h2 id="add-product-title">Adicionar produto</h2>
          </div>
          <button className="icon-button" onClick={onClose} disabled={submitting} aria-label="Fechar">
            <X size={20} />
          </button>
        </header>

        <div className="product-modal__body">
          <label className="product-search">
            <Search size={18} />
            <input
              autoFocus
              value={query}
              onChange={event => setQuery(event.target.value)}
              placeholder="Buscar por nome, código ou apelido"
            />
          </label>

          <div className="product-results" aria-live="polite">
            {loading && <div className="product-results__feedback">Buscando produtos...</div>}
            {!loading && error && <div className="product-results__feedback product-results__feedback--error">{error}</div>}
            {!loading && !error && products.length === 0 && (
              <div className="product-results__feedback">Nenhum produto encontrado.</div>
            )}
            {!loading && !error && products.map(product => (
              <button
                type="button"
                key={product.id}
                className={`product-result${selected?.id === product.id ? " product-result--selected" : ""}`}
                onClick={() => {
                  setSelected(product);
                  setQuantity(1);
                }}
              >
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.code} · {product.category.name}</small>
                </span>
                <b>{formatCurrency(product.price)}</b>
              </button>
            ))}
          </div>
        </div>

        {submitError && <div className="product-modal__submit-error" role="alert">{submitError}</div>}

        <footer className="product-modal__footer">
          {selected ? (
            <>
              <div className="selected-product-summary">
                <span>{selected.name}</span>
                <strong>{formatCurrency(itemTotal)}</strong>
              </div>
              <div className="quantity-control" aria-label="Quantidade">
                <button type="button" onClick={() => setQuantity(value => Math.max(1, value - 1))} disabled={quantity <= 1 || submitting}>
                  <Minus size={17} />
                </button>
                <input
                  type="number"
                  min={1}
                  max={99}
                  value={quantity}
                  onChange={event => setQuantity(Math.min(99, Math.max(1, Number(event.target.value) || 1)))}
                />
                <button type="button" onClick={() => setQuantity(value => Math.min(99, value + 1))} disabled={quantity >= 99 || submitting}>
                  <Plus size={17} />
                </button>
              </div>
              <button className="button button--accent" onClick={() => void handleConfirm()} disabled={submitting}>
                <ShoppingCart size={18} />
                {submitting ? "Adicionando..." : "Adicionar à comanda"}
              </button>
            </>
          ) : (
            <span className="product-modal__hint">Selecione um produto para continuar.</span>
          )}
        </footer>
      </section>
    </div>
  );
}
