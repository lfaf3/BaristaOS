import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  RefreshCw,
  Search,
  ServerOff,
  X
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { PrintModal } from "../print/PrintModal";
import { normalizeApiError } from "../services/api/api-error";
import {
  orderHistoryService,
  type HistoryPaymentMethod,
  type OrderHistoryDetail,
  type OrderHistorySummary
} from "../services/api/order-history.service";
import { formatCurrency } from "../utils/currency";

function today() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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

export function OrderHistoryPage() {
  const [orders, setOrders] = useState<OrderHistorySummary[]>([]);
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());
  const [tableNumber, setTableNumber] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({
    dateFrom: today(),
    dateTo: today(),
    tableNumber: ""
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<OrderHistoryDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [printOrder, setPrintOrder] = useState<OrderHistoryDetail | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await orderHistoryService.list({
        dateFrom: appliedFilters.dateFrom || undefined,
        dateTo: appliedFilters.dateTo || undefined,
        tableNumber: appliedFilters.tableNumber
          ? Number(appliedFilters.tableNumber)
          : undefined,
        page,
        pageSize: 20
      });
      setOrders(response.data);
      setTotalPages(response.pagination.totalPages);
      setTotalCount(response.pagination.totalCount);
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, page]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    setPage(1);
    setAppliedFilters({ dateFrom, dateTo, tableNumber });
  }

  function clearFilters() {
    const currentDate = today();
    setDateFrom(currentDate);
    setDateTo(currentDate);
    setTableNumber("");
    setPage(1);
    setAppliedFilters({ dateFrom: currentDate, dateTo: currentDate, tableNumber: "" });
  }

  async function openDetail(orderId: string) {
    setSelected(null);
    setDetailError(null);
    setDetailLoading(true);
    try {
      setSelected(await orderHistoryService.getById(orderId));
    } catch (cause) {
      setDetailError(normalizeApiError(cause).message);
    } finally {
      setDetailLoading(false);
    }
  }

  return (
    <main className="dashboard-layout">
      <Sidebar />
      <section className="dashboard-main">
        <Topbar
          actions={
            <button
              className="button button--soft"
              onClick={() => void loadOrders()}
              disabled={loading}
            >
              <RefreshCw size={17} className={loading ? "icon-spin" : undefined} />
              Atualizar
            </button>
          }
        />

        <div className="dashboard-content history-page">
          <div className="page-heading">
            <div>
              <span className="eyebrow">Consulta operacional</span>
              <h1>Histórico de comandas</h1>
            </div>
            <div className="history-count">
              <b>{totalCount}</b>
              <span>{totalCount === 1 ? "comanda encontrada" : "comandas encontradas"}</span>
            </div>
          </div>

          <form className="history-filters" onSubmit={handleSearch}>
            <label>
              <span>Data inicial</span>
              <input type="date" value={dateFrom} onChange={event => setDateFrom(event.target.value)} />
            </label>
            <label>
              <span>Data final</span>
              <input type="date" value={dateTo} onChange={event => setDateTo(event.target.value)} />
            </label>
            <label>
              <span>Número da mesa</span>
              <input
                type="number"
                min="1"
                placeholder="Todas"
                value={tableNumber}
                onChange={event => setTableNumber(event.target.value)}
              />
            </label>
            <button className="button button--primary" type="submit" disabled={loading}>
              <Search size={17} /> Pesquisar
            </button>
            <button className="button button--soft" type="button" onClick={clearFilters}>
              Limpar
            </button>
          </form>

          {loading && orders.length === 0 && (
            <div className="history-feedback">
              <RefreshCw size={30} className="icon-spin" />
              <span>Carregando comandas...</span>
            </div>
          )}

          {!loading && error && (
            <div className="history-feedback history-feedback--error" role="alert">
              <ServerOff size={38} />
              <strong>Não foi possível carregar o histórico</strong>
              <span>{error}</span>
              <button className="button button--primary" onClick={() => void loadOrders()}>
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && orders.length === 0 && (
            <div className="history-feedback">
              <ClipboardList size={42} strokeWidth={1.5} />
              <strong>Nenhuma comanda encerrada no período</strong>
              <span>Altere os filtros para consultar outros atendimentos.</span>
            </div>
          )}

          {orders.length > 0 && (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Encerramento</th>
                    <th>Mesa</th>
                    <th>Itens</th>
                    <th>Pagamento</th>
                    <th>Operador</th>
                    <th className="history-table__money">Total</th>
                    <th aria-label="Detalhes" />
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td>{formatDateTime(order.closedAt)}</td>
                      <td>{order.table ? `Mesa ${order.table.number}` : "Balcão"}</td>
                      <td>{order.itemCount}</td>
                      <td>{order.payments.map(payment => paymentLabel(payment.method)).join(" + ") || "—"}</td>
                      <td>{order.operator.name}</td>
                      <td className="history-table__money"><b>{formatCurrency(order.total)}</b></td>
                      <td>
                        <button
                          type="button"
                          className="history-detail-button"
                          onClick={() => void openDetail(order.id)}
                          aria-label="Ver detalhes da comanda"
                        >
                          <ChevronDown size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="history-pagination">
              <button
                className="button button--soft"
                disabled={page <= 1 || loading}
                onClick={() => setPage(current => Math.max(1, current - 1))}
              >
                <ChevronLeft size={17} /> Anterior
              </button>
              <span>Página <b>{page}</b> de <b>{totalPages}</b></span>
              <button
                className="button button--soft"
                disabled={page >= totalPages || loading}
                onClick={() => setPage(current => Math.min(totalPages, current + 1))}
              >
                Próxima <ChevronRight size={17} />
              </button>
            </div>
          )}
        </div>
      </section>

      {(detailLoading || detailError || selected) && (
        <div className="history-modal-backdrop" role="presentation" onMouseDown={() => !detailLoading && setSelected(null)}>
          <section className="history-modal" role="dialog" aria-modal="true" onMouseDown={event => event.stopPropagation()}>
            <header>
              <div>
                <span className="eyebrow">Comanda encerrada</span>
                <h2>{selected?.table ? `Mesa ${selected.table.number}` : "Venda balcão"}</h2>
              </div>
              <div className="history-modal-actions">
                {selected && (
                  <button
                    type="button"
                    className="button button--soft history-print-button"
                    onClick={() => setPrintOrder(selected)}
                  >
                    Pré-visualizar impressão
                  </button>
                )}
                <button type="button" className="history-modal-close" onClick={() => setSelected(null)} aria-label="Fechar detalhes">
                  <X size={20} />
                </button>
              </div>
            </header>

            {detailLoading && <div className="history-modal-loading"><RefreshCw className="icon-spin" /> Carregando detalhes...</div>}
            {detailError && <div className="history-modal-error">{detailError}</div>}

            {selected && (
              <div className="history-modal-content">
                <div className="history-meta-grid">
                  <div><span>Aberta em</span><b>{formatDateTime(selected.openedAt)}</b></div>
                  <div><span>Encerrada em</span><b>{formatDateTime(selected.closedAt)}</b></div>
                  <div><span>Operador</span><b>{selected.operator.name}</b></div>
                  <div><span>Pessoas</span><b>{selected.guestCount || "—"}</b></div>
                </div>

                <div className="history-detail-section">
                  <h3>Itens</h3>
                  {selected.items.map(item => (
                    <div className="history-item" key={item.id}>
                      <div>
                        <b>{item.quantity}× {item.name}</b>
                        {item.notes && <small>{item.notes}</small>}
                      </div>
                      <span>{formatCurrency(item.totalPrice)}</span>
                    </div>
                  ))}
                </div>

                <div className="history-detail-section">
                  <h3>Pagamentos</h3>
                  {selected.payments.map(payment => (
                    <div className="history-payment" key={payment.id}>
                      <span>{paymentLabel(payment.method)}</span>
                      <b>{formatCurrency(payment.amount)}</b>
                    </div>
                  ))}
                </div>

                <div className="history-totals">
                  <div><span>Subtotal</span><span>{formatCurrency(selected.subtotal)}</span></div>
                  {selected.discount > 0 && <div><span>Desconto</span><span>− {formatCurrency(selected.discount)}</span></div>}
                  {selected.serviceCharge > 0 && <div><span>Serviço ({selected.serviceChargePercentage}%)</span><span>{formatCurrency(selected.serviceCharge)}</span></div>}
                  <div className="history-totals__grand"><b>Total</b><b>{formatCurrency(selected.total)}</b></div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}

      {printOrder && (
        <PrintModal order={printOrder} onClose={() => setPrintOrder(null)} />
      )}
    </main>
  );
}
