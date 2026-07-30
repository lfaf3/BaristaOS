import {
  AlertTriangle, ArrowDownRight, ArrowUpRight, Banknote, BellRing, CheckCircle2,
  Clock3, Coffee, CreditCard, Grid2X2, PackageOpen, ReceiptText, RefreshCw,
  ServerOff, ShoppingBag, Sparkles, TrendingUp, UtensilsCrossed
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { normalizeApiError } from "../services/api/api-error";
import { dashboardService, type DashboardPaymentMethod, type DashboardSummary } from "../services/api/dashboard.service";
import { formatCurrency } from "../utils/currency";

function paymentLabel(method: DashboardPaymentMethod) {
  return ({ CASH: "Dinheiro", PIX: "PIX", TEF_CREDIT: "Crédito", TEF_DEBIT: "Débito", COURTESY: "Cortesia" })[method];
}

function Change({ value }: { value: number }) {
  const positive = value >= 0;
  return <span className={`dashboard-change ${positive ? "dashboard-change--positive" : "dashboard-change--negative"}`}>
    {positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
    {Math.abs(value).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}% vs. ontem
  </span>;
}

function SalesChart({ data }: { data: DashboardSummary["salesTrend"] }) {
  const max = Math.max(...data.map(item => item.revenue), 1);
  const points = data.map((item, index) => `${(index / Math.max(data.length - 1, 1)) * 100},${92 - (item.revenue / max) * 72}`).join(" ");
  return <div className="smart-chart">
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Vendas dos últimos sete dias">
      <defs><linearGradient id="salesFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--primary)" stopOpacity=".28"/><stop offset="100%" stopColor="var(--primary)" stopOpacity=".02"/></linearGradient></defs>
      <polygon points={`0,100 ${points} 100,100`} fill="url(#salesFill)" />
      <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth="2.4" vectorEffect="non-scaling-stroke" />
      {data.map((item, index) => <circle key={item.date} cx={(index / Math.max(data.length - 1, 1)) * 100} cy={92 - (item.revenue / max) * 72} r="1.8" fill="var(--surface)" stroke="var(--primary)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />)}
    </svg>
    <div className="smart-chart__labels">{data.map(item => <div key={item.date}><span>{item.label}</span><strong>{formatCurrency(item.revenue)}</strong></div>)}</div>
  </div>;
}

function Donut({ summary }: { summary: DashboardSummary["tables"] }) {
  const activeTotal = Math.max(summary.total - summary.blocked, 1);
  const service = (summary.inService / activeTotal) * 100;
  const payment = (summary.awaitingPayment / activeTotal) * 100;
  const free = (summary.free / activeTotal) * 100;
  return <div className="table-donut" style={{ background: `conic-gradient(var(--primary) 0 ${service}%, #d68b3c ${service}% ${service + payment}%, #4da578 ${service + payment}% ${service + payment + free}%, var(--line) 0)` }}>
    <div><strong>{summary.total}</strong><span>mesas</span></div>
  </div>;
}

function DashboardSkeleton() {
  return <div className="dashboard-skeleton" aria-label="Carregando dashboard">
    <div className="dashboard-kpis">{Array.from({ length: 4 }).map((_, index) => <div className="skeleton-card" key={index} />)}</div>
    <div className="dashboard-grid"><div className="skeleton-panel"/><div className="skeleton-panel"/></div>
  </div>;
}

export function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try { setSummary(await dashboardService.getSummary()); }
    catch (cause) { setError(normalizeApiError(cause).message); }
    finally { if (!silent) setLoading(false); }
  }, []);

  useEffect(() => {
    void load();
    const timer = window.setInterval(() => void load(true), 60000);
    return () => window.clearInterval(timer);
  }, [load]);

  const updatedAt = useMemo(() => summary ? new Date(summary.generatedAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : null, [summary]);

  return <main className="dashboard-layout">
    <Sidebar />
    <section className="dashboard-main">
      <Topbar actions={<button className="button button--soft" onClick={() => void load()} disabled={loading}><RefreshCw size={17} className={loading ? "icon-spin" : undefined}/>Atualizar</button>} />
      <div className="dashboard-content management-dashboard smart-dashboard">
        <div className="page-heading smart-dashboard__heading">
          <div><span className="eyebrow">Central de operação</span><h1>Dashboard inteligente</h1><p className="dashboard-subtitle">Uma visão rápida das vendas, mesas e ritmo da cafeteria.</p></div>
          {updatedAt && <div className="dashboard-live"><span/><div><strong>Atualização automática</strong><small>Última leitura às {updatedAt}</small></div></div>}
        </div>

        {loading && !summary && <DashboardSkeleton />}
        {!loading && error && !summary && <div className="history-feedback history-feedback--error" role="alert"><ServerOff size={38}/><strong>Não foi possível carregar o dashboard</strong><span>{error}</span><button className="button button--primary" onClick={() => void load()}>Tentar novamente</button></div>}

        {summary && <>
          {error && <div className="dashboard-inline-error"><AlertTriangle size={17}/>Os dados exibidos são da última atualização. {error}</div>}
          <section className="dashboard-kpis">
            <article className="dashboard-kpi dashboard-kpi--featured"><div className="dashboard-kpi__icon"><Banknote size={21}/></div><span>Vendas de hoje</span><strong>{formatCurrency(summary.sales.revenue)}</strong><Change value={summary.sales.revenueChangePercentage}/></article>
            <article className="dashboard-kpi"><div className="dashboard-kpi__icon"><ReceiptText size={21}/></div><span>Pedidos de hoje</span><strong>{summary.sales.orderCount}</strong><Change value={summary.sales.orderCountChangePercentage}/></article>
            <article className="dashboard-kpi"><div className="dashboard-kpi__icon"><TrendingUp size={21}/></div><span>Ticket médio</span><strong>{formatCurrency(summary.sales.averageTicket)}</strong><small>por comanda paga</small></article>
            <article className="dashboard-kpi"><div className="dashboard-kpi__icon"><Grid2X2 size={21}/></div><span>Mesas ocupadas</span><strong>{summary.tables.inService + summary.tables.awaitingPayment}</strong><small>{summary.tables.free} livres de {summary.tables.total}</small></article>
          </section>

          <section className="dashboard-grid dashboard-grid--hero">
            <article className="dashboard-panel dashboard-panel--chart"><header><div><span className="panel-eyebrow">Desempenho</span><h2>Vendas nos últimos 7 dias</h2></div><TrendingUp size={21}/></header><SalesChart data={summary.salesTrend}/></article>
            <article className="dashboard-panel dashboard-panel--goal"><header><div><span className="panel-eyebrow">Objetivo diário</span><h2>Meta de vendas</h2></div><Sparkles size={21}/></header><div className="goal-value"><strong>{formatCurrency(summary.goal.achieved)}</strong><span>de {formatCurrency(summary.goal.target)}</span></div><div className="goal-track"><span style={{ width: `${summary.goal.percentage}%` }}/></div><div className="goal-footer"><strong>{summary.goal.percentage}% atingido</strong><span>{summary.goal.achieved >= summary.goal.target ? "Meta alcançada!" : `Faltam ${formatCurrency(summary.goal.target - summary.goal.achieved)}`}</span></div></article>
          </section>

          <section className="dashboard-operation-strip">
            <div><PackageOpen size={20}/><span>Em andamento</span><strong>{summary.operation.openOrders}</strong></div>
            <div><CheckCircle2 size={20}/><span>Finalizados hoje</span><strong>{summary.operation.paidOrders}</strong></div>
            <div><Clock3 size={20}/><span>Tempo médio</span><strong>{summary.operation.averageServiceMinutes} min</strong></div>
          </section>

          <section className="dashboard-grid">
            <article className="dashboard-panel"><header><div><span className="panel-eyebrow">Ranking</span><h2>Produtos mais vendidos</h2></div><Coffee size={21}/></header><div className="product-ranking">{summary.topProducts.length ? summary.topProducts.map((product, index) => <div key={product.id}><span className="rank-position">{index + 1}</span><div><strong>{product.name}</strong><small>{formatCurrency(product.revenue)} em vendas</small></div><b>{product.quantity} un.</b></div>) : <div className="dashboard-empty-state"><ShoppingBag size={28}/><span>Ainda não há produtos vendidos hoje.</span></div>}</div></article>
            <article className="dashboard-panel"><header><div><span className="panel-eyebrow">Salão</span><h2>Situação das mesas</h2></div><UtensilsCrossed size={21}/></header><div className="table-overview"><Donut summary={summary.tables}/><div className="table-legend"><div><i className="dot dot--free"/><span>Livres</span><strong>{summary.tables.free}</strong></div><div><i className="dot dot--service"/><span>Em atendimento</span><strong>{summary.tables.inService}</strong></div><div><i className="dot dot--payment"/><span>Aguardando pagamento</span><strong>{summary.tables.awaitingPayment}</strong></div><div><i className="dot dot--blocked"/><span>Bloqueadas</span><strong>{summary.tables.blocked}</strong></div></div></div></article>
          </section>

          <section className="dashboard-grid">
            <article className="dashboard-panel"><header><div><span className="panel-eyebrow">Atenção</span><h2>Alertas operacionais</h2></div><BellRing size={21}/></header><div className="alert-list">{summary.alerts.length ? summary.alerts.map(alert => <div className={`alert-item alert-item--${alert.severity.toLowerCase()}`} key={alert.id}><AlertTriangle size={18}/><div><strong>{alert.title}</strong><span>{alert.message}</span></div></div>) : <div className="dashboard-empty-state dashboard-empty-state--success"><CheckCircle2 size={28}/><span>Nenhum alerta operacional neste momento.</span></div>}</div></article>
            <article className="dashboard-panel"><header><div><span className="panel-eyebrow">Tempo real</span><h2>Últimas movimentações</h2></div><RefreshCw size={21}/></header><div className="activity-list">{summary.activities.length ? summary.activities.map(activity => <div key={activity.id}><div className="activity-icon">{activity.type === "PAYMENT" ? <CreditCard size={16}/> : <Coffee size={16}/>}</div><div><strong>{activity.title}</strong><span>{activity.description}</span></div><time>{new Date(activity.occurredAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</time></div>) : <div className="dashboard-empty-state"><ReceiptText size={28}/><span>Nenhuma movimentação recente.</span></div>}</div></article>
          </section>

          <section className="dashboard-highlights dashboard-highlights--compact">
            <article className="dashboard-highlight-card"><div className="dashboard-highlight-card__heading"><Coffee size={20}/><span>Destaque do dia</span></div><strong>{summary.highlights.topProduct?.name ?? "Sem vendas"}</strong><small>{summary.highlights.topProduct ? `${summary.highlights.topProduct.quantity} unidade(s)` : "Aguardando os primeiros pedidos"}</small></article>
            <article className="dashboard-highlight-card"><div className="dashboard-highlight-card__heading"><CreditCard size={20}/><span>Pagamento principal</span></div><strong>{summary.highlights.mainPaymentMethod ? paymentLabel(summary.highlights.mainPaymentMethod.method) : "Sem pagamentos"}</strong><small>{summary.highlights.mainPaymentMethod ? formatCurrency(summary.highlights.mainPaymentMethod.amount) : "Nenhum registro hoje"}</small></article>
            <article className="dashboard-highlight-card"><div className="dashboard-highlight-card__heading"><Grid2X2 size={20}/><span>Mesa mais utilizada</span></div><strong>{summary.highlights.mostUsedTable ? `Mesa ${summary.highlights.mostUsedTable.number}` : "Sem dados"}</strong><small>{summary.highlights.mostUsedTable ? `${summary.highlights.mostUsedTable.orders} atendimento(s)` : "Nenhuma mesa encerrada"}</small></article>
          </section>
        </>}
      </div>
    </section>
  </main>;
}
