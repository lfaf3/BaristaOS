import { CreditCard, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Topbar } from "../components/Topbar";
import { useToast } from "../components/feedback/ToastProvider";
import { paymentService, type PaymentProviderCode, type PaymentSettings, type PaymentTimeoutSeconds, type PaymentTransactionLog } from "../services/api/payment.service";

const providers: Array<{ code: PaymentProviderCode; name: string; enabled: boolean }> = [
  { code: "MOCK", name: "Mock", enabled: true }, { code: "SITEF", name: "SiTef", enabled: false }, { code: "PAYGO", name: "PayGo", enabled: false }
];

export function PaymentSettingsPage() {
  const toast = useToast();
  const [settings, setSettings] = useState<PaymentSettings>(() => paymentService.getSettings());
  const [logs, setLogs] = useState<PaymentTransactionLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [logsError, setLogsError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 5;
  useEffect(() => {
    let active = true;
    setLoadingLogs(true);
    setLogsError(null);
    paymentService.getTransactionLogs(page, pageSize)
      .then(result => { if (active) { setLogs(result.items); setTotal(result.pagination.total); setTotalPages(result.pagination.totalPages); } })
      .catch(() => { if (active) setLogsError("Não foi possível carregar o log de transações."); })
      .finally(() => { if (active) setLoadingLogs(false); });
    return () => { active = false; };
  }, [page]);
  const update = <K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) => setSettings((current: PaymentSettings) => ({ ...current, [key]: value }));
  function save() { paymentService.updateSettings(settings); toast.success("Configurações de pagamento salvas."); }

  return <main className="dashboard-layout"><Sidebar /><section className="dashboard-main">
    <Topbar />
    <div className="dashboard-content payment-settings-page">
      <div className="page-heading settings-heading"><div><span className="eyebrow">Configurações / Pagamentos</span><h1>Pagamentos</h1><p>Selecione o provedor e o comportamento das sessões TEF.</p></div><button className="button button--primary" onClick={save}><Save size={17} />Salvar alterações</button></div>
      <section className="settings-panel">
        <div className="settings-panel__heading"><h2><CreditCard size={20} /> Provedor</h2><span>SiTef e PayGo estão preparados para os adaptadores da próxima versão.</span></div>
        <div className="payment-provider-options">{providers.map(provider => <label key={provider.code} className={settings.provider === provider.code ? "payment-provider-option payment-provider-option--active" : "payment-provider-option"}><input type="radio" name="provider" disabled={!provider.enabled} checked={settings.provider === provider.code} onChange={() => update("provider", provider.code)} /><strong>{provider.name}</strong><small>{provider.enabled ? "Disponível" : "Em breve"}</small></label>)}</div>
        <div className="settings-grid payment-settings-grid">
          <label className="settings-field"><span>Timeout por sessão</span><select value={settings.timeout} onChange={event => update("timeout", Number(event.target.value) as PaymentTimeoutSeconds)}><option value={30}>30 segundos</option><option value={60}>60 segundos</option><option value={120}>120 segundos</option></select></label>
          <label className="settings-field"><span>Tentativas automáticas</span><input type="number" min={0} max={5} value={settings.retryAttempts} onChange={event => update("retryAttempts", Number(event.target.value))} /></label>
          <label className="settings-switch"><span>Confirmar automaticamente</span><input type="checkbox" checked={settings.autoConfirm} onChange={event => update("autoConfirm", event.target.checked)} /><i /></label>
          <label className="settings-switch"><span>Registrar transações</span><input type="checkbox" checked={settings.logTransactions} onChange={event => update("logTransactions", event.target.checked)} /><i /></label>
        </div>
      </section>
      <section className="settings-panel transaction-log-panel"><div className="settings-panel__heading"><h2>Log de transações</h2><span>Últimas operações TEF da loja e sessões Mock deste dispositivo.</span></div>
        {loadingLogs ? <p className="transaction-log-empty">Carregando transações...</p> : logsError ? <p className="transaction-log-empty">{logsError}</p> : logs.length === 0 ? <p className="transaction-log-empty">Nenhuma sessão encerrada registrada.</p> : <><div className="transaction-log-wrap"><table><thead><tr><th>Data</th><th>Hora</th><th>Sessão</th><th>Operadora</th><th>Valor</th><th>Status</th><th>Duração</th></tr></thead><tbody>{logs.map((log: PaymentTransactionLog) => <tr key={log.sessionId}><td>{log.date}</td><td>{log.time}</td><td>{log.sessionId}</td><td>{log.provider}</td><td>{log.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td><td>{log.status}</td><td>{(log.durationMs / 1000).toFixed(1)} s</td></tr>)}</tbody></table></div><footer className="transaction-log-pagination"><span>{total} {total === 1 ? "operação" : "operações"}</span><div><button className="button button--soft" disabled={page <= 1 || loadingLogs} onClick={() => setPage(current => current - 1)}>Anterior</button><span>Página {page} de {totalPages}</span><button className="button button--soft" disabled={page >= totalPages || loadingLogs} onClick={() => setPage(current => current + 1)}>Próxima</button></div></footer></>}
      </section>
    </div>
  </section></main>;
}
