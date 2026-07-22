import {
  ArrowLeft,
  Clock3,
  Plus,
  ReceiptText,
  RefreshCw,
  ServerOff,
  Users
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { normalizeApiError } from "../services/api/api-error";
import { ordersService } from "../services/api/orders.service";
import type { TableOrder } from "../types";
import { formatCurrency } from "../utils/currency";

function formatOpenedAt(value: string | null) {
  if (!value) return "Horário não informado";

  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function TableOrderPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<TableOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    if (!id) {
      setError("Identificador da mesa não informado.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setData(await ordersService.getByTable(id));
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  return (
    <main className="dashboard-layout">
      <Sidebar />
      <section className="dashboard-main">
        <Topbar
          actions={
            <>
              <button className="button button--soft" onClick={() => navigate("/mesas")}>
                <ArrowLeft size={17} />
                Voltar às mesas
              </button>
              <button
                className="button button--soft"
                onClick={() => void loadOrder()}
                disabled={loading}
              >
                <RefreshCw size={17} className={loading ? "icon-spin" : undefined} />
                Atualizar
              </button>
            </>
          }
        />

        <div className="dashboard-content order-page-content">
          {loading && !data && (
            <div className="order-page-loading" aria-label="Carregando comanda">
              <RefreshCw size={30} className="icon-spin" />
              <strong>Carregando comanda...</strong>
            </div>
          )}

          {!loading && error && (
            <div className="tables-feedback" role="alert">
              <ServerOff size={40} strokeWidth={1.6} />
              <strong>Não foi possível carregar a comanda</strong>
              <span>{error}</span>
              <button className="button button--primary" onClick={() => void loadOrder()}>
                Tentar novamente
              </button>
            </div>
          )}

          {data && (
            <>
              <header className="order-heading">
                <div>
                  <span className="eyebrow">Comanda em atendimento</span>
                  <h1>{data.table.name ?? `Mesa ${String(data.table.number).padStart(2, "0")}`}</h1>
                  <div className="order-heading__meta">
                    <span><Clock3 size={16} /> Aberta às {formatOpenedAt(data.table.openedAt)}</span>
                    <span><Users size={16} /> {data.table.people} pessoas</span>
                  </div>
                </div>
                <span className="status-pill status-pill--open">Em atendimento</span>
              </header>

              <div className="order-layout">
                <section className="order-card order-items-card">
                  <div className="order-card__header">
                    <div>
                      <span className="eyebrow">Itens da comanda</span>
                      <h2>Consumo</h2>
                    </div>
                    <button className="button button--accent" disabled title="Disponível na próxima release">
                      <Plus size={18} />
                      Adicionar produto
                    </button>
                  </div>

                  {data.items.length === 0 ? (
                    <div className="order-empty-state">
                      <ReceiptText size={44} strokeWidth={1.5} />
                      <strong>Nenhum item adicionado</strong>
                      <span>A inclusão de produtos será liberada na próxima release.</span>
                    </div>
                  ) : (
                    <div className="order-items-list">
                      {data.items.map(item => (
                        <article className="order-item-row" key={item.id}>
                          <div>
                            <strong>{item.quantity}× {item.name}</strong>
                            <span>{item.code} · {formatCurrency(item.unitPrice)} cada</span>
                          </div>
                          <b>{formatCurrency(item.totalPrice)}</b>
                        </article>
                      ))}
                    </div>
                  )}
                </section>

                <aside className="order-card order-summary-card">
                  <span className="eyebrow">Resumo</span>
                  <h2>Total da mesa</h2>
                  <dl className="order-summary-list">
                    <div><dt>Subtotal</dt><dd>{formatCurrency(data.subtotal)}</dd></div>
                    {data.discount > 0 && (
                      <div><dt>Desconto</dt><dd>- {formatCurrency(data.discount)}</dd></div>
                    )}
                    <div><dt>Serviço</dt><dd>{formatCurrency(data.serviceCharge)}</dd></div>
                    <div className="order-summary-total">
                      <dt>Total</dt><dd>{formatCurrency(data.total)}</dd>
                    </div>
                  </dl>
                  <p className="order-summary-note">
                    {data.order
                      ? `Comanda ${data.order.id.slice(0, 8).toUpperCase()}`
                      : "Comanda vazia — pronta para receber itens."}
                  </p>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
