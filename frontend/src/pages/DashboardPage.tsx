import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Coffee,
  CreditCard,
  Grid2X2,
  ReceiptText,
  RefreshCw,
  ServerOff,
  TrendingUp
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { normalizeApiError } from "../services/api/api-error";
import {
  dashboardService,
  type DashboardPaymentMethod,
  type DashboardSummary
} from "../services/api/dashboard.service";
import { formatCurrency } from "../utils/currency";

function paymentLabel(method: DashboardPaymentMethod) {
  const labels: Record<DashboardPaymentMethod, string> = {
    CASH: "Dinheiro",
    PIX: "PIX",
    TEF_CREDIT: "Crédito",
    TEF_DEBIT: "Débito",
    COURTESY: "Cortesia"
  };
  return labels[method];
}

function Change({ value }: { value: number }) {
  const positive = value >= 0;
  return (
    <span className={`dashboard-change ${positive ? "dashboard-change--positive" : "dashboard-change--negative"}`}>
      {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {Math.abs(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% vs. ontem
    </span>
  );
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setSummary(await dashboardService.getSummary());
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main className="dashboard-layout">
      <Sidebar />
      <section className="dashboard-main">
        <Topbar
          actions={
            <button className="button button--soft" onClick={() => void load()} disabled={loading}>
              <RefreshCw size={17} className={loading ? "icon-spin" : undefined} />
              Atualizar
            </button>
          }
        />

        <div className="dashboard-content management-dashboard">
          <div className="page-heading">
            <div>
              <span className="eyebrow">Visão gerencial</span>
              <h1>Resumo de hoje</h1>
              <p className="dashboard-subtitle">Indicadores atualizados com as comandas pagas da loja.</p>
            </div>
          </div>

          {loading && !summary && (
            <div className="history-feedback">
              <RefreshCw size={30} className="icon-spin" />
              <span>Carregando indicadores...</span>
            </div>
          )}

          {!loading && error && (
            <div className="history-feedback history-feedback--error" role="alert">
              <ServerOff size={38} />
              <strong>Não foi possível carregar o dashboard</strong>
              <span>{error}</span>
              <button className="button button--primary" onClick={() => void load()}>Tentar novamente</button>
            </div>
          )}

          {summary && (
            <>
              <section className="dashboard-kpis">
                <article className="dashboard-kpi">
                  <div className="dashboard-kpi__icon"><Banknote size={21} /></div>
                  <span>Faturamento do dia</span>
                  <strong>{formatCurrency(summary.sales.revenue)}</strong>
                  <Change value={summary.sales.revenueChangePercentage} />
                </article>
                <article className="dashboard-kpi">
                  <div className="dashboard-kpi__icon"><ReceiptText size={21} /></div>
                  <span>Pedidos pagos</span>
                  <strong>{summary.sales.orderCount}</strong>
                  <Change value={summary.sales.orderCountChangePercentage} />
                </article>
                <article className="dashboard-kpi">
                  <div className="dashboard-kpi__icon"><TrendingUp size={21} /></div>
                  <span>Ticket médio</span>
                  <strong>{formatCurrency(summary.sales.averageTicket)}</strong>
                  <small>por comanda encerrada</small>
                </article>
                <article className="dashboard-kpi">
                  <div className="dashboard-kpi__icon"><Grid2X2 size={21} /></div>
                  <span>Mesas em atendimento</span>
                  <strong>{summary.tables.inService}</strong>
                  <small>{summary.tables.free} livres de {summary.tables.total}</small>
                </article>
              </section>

              <section className="dashboard-highlights">
                <article className="dashboard-highlight-card">
                  <div className="dashboard-highlight-card__heading">
                    <Coffee size={20} />
                    <span>Produto mais vendido</span>
                  </div>
                  {summary.highlights.topProduct ? (
                    <>
                      <strong>{summary.highlights.topProduct.name}</strong>
                      <small>{summary.highlights.topProduct.quantity} unidade(s) vendida(s)</small>
                    </>
                  ) : <span className="dashboard-empty">Ainda não há vendas hoje.</span>}
                </article>

                <article className="dashboard-highlight-card">
                  <div className="dashboard-highlight-card__heading">
                    <CreditCard size={20} />
                    <span>Forma de pagamento principal</span>
                  </div>
                  {summary.highlights.mainPaymentMethod ? (
                    <>
                      <strong>{paymentLabel(summary.highlights.mainPaymentMethod.method)}</strong>
                      <small>{formatCurrency(summary.highlights.mainPaymentMethod.amount)} em {summary.highlights.mainPaymentMethod.transactions} lançamento(s)</small>
                    </>
                  ) : <span className="dashboard-empty">Nenhum pagamento registrado hoje.</span>}
                </article>

                <article className="dashboard-highlight-card">
                  <div className="dashboard-highlight-card__heading">
                    <Grid2X2 size={20} />
                    <span>Mesa mais utilizada</span>
                  </div>
                  {summary.highlights.mostUsedTable ? (
                    <>
                      <strong>Mesa {summary.highlights.mostUsedTable.number}</strong>
                      <small>{summary.highlights.mostUsedTable.orders} atendimento(s) encerrado(s)</small>
                    </>
                  ) : <span className="dashboard-empty">Nenhuma mesa encerrada hoje.</span>}
                </article>
              </section>

              <section className="dashboard-table-status">
                <div><span>Livres</span><strong>{summary.tables.free}</strong></div>
                <div><span>Em atendimento</span><strong>{summary.tables.inService}</strong></div>
                <div><span>Bloqueadas</span><strong>{summary.tables.blocked}</strong></div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
