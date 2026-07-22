import { RefreshCw, ServerOff } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app/AppContext";
import { Sidebar } from "../components/Sidebar";
import { TableCard } from "../components/TableCard";
import { Topbar } from "../components/Topbar";
import { normalizeApiError } from "../services/api/api-error";
import { tablesService } from "../services/api/tables.service";

export function TablesPage() {
  const navigate = useNavigate();
  const { tables, setTables, setSelectedTable, setCounterSale } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [openingTableId, setOpeningTableId] = useState<string | null>(null);

  const loadTables = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await tablesService.list();
      setTables(response);
    } catch (cause) {
      setError(normalizeApiError(cause).message);
    } finally {
      setLoading(false);
    }
  }, [setTables]);

  useEffect(() => {
    void loadTables();
  }, [loadTables]);

  async function handleTableClick(tableId: string) {
    const table = tables.find(item => item.id === tableId);

    if (!table || openingTableId) {
      return;
    }

    if (table.status === "open" || table.status === "payment") {
      navigate(`/mesas/${table.id}`);
      return;
    }

    if (table.status !== "free") {
      return;
    }

    setOpeningTableId(tableId);
    setActionError(null);

    try {
      const updatedTable = await tablesService.open(tableId);
      setTables(current =>
        current.map(item => (item.id === updatedTable.id ? updatedTable : item))
      );
      setSelectedTable(updatedTable.number);
      setCounterSale(false);
    } catch (cause) {
      setActionError(normalizeApiError(cause).message);
    } finally {
      setOpeningTableId(null);
    }
  }

  function openCounter() {
    setSelectedTable(null);
    setCounterSale(true);
  }

  const free = tables.filter(table => table.status === "free").length;
  const open = tables.filter(table => table.status === "open").length;
  const payment = tables.filter(table => table.status === "payment").length;

  return (
    <main className="dashboard-layout">
      <Sidebar />
      <section className="dashboard-main">
        <Topbar
          actions={
            <>
              <button
                className="button button--soft"
                onClick={() => void loadTables()}
                disabled={loading || openingTableId !== null}
              >
                <RefreshCw size={17} className={loading ? "icon-spin" : undefined} />
                Atualizar
              </button>
              <button className="button button--soft" onClick={openCounter}>
                Venda balcão
              </button>
            </>
          }
        />

        <div className="dashboard-content">
          <div className="page-heading">
            <div>
              <span className="eyebrow">Visão operacional</span>
              <h1>Mapa de mesas</h1>
            </div>

            <div className="operation-summary">
              <span><b>{free}</b> livres</span>
              <span><b>{open}</b> em atendimento</span>
              <span><b>{payment}</b> pagamento</span>
            </div>
          </div>

          {actionError && (
            <div className="tables-action-error" role="alert">
              <span>{actionError}</span>
              <button type="button" onClick={() => setActionError(null)}>
                Fechar
              </button>
            </div>
          )}

          {loading && tables.length === 0 && (
            <div className="tables-grid" aria-label="Carregando mesas">
              {Array.from({ length: 12 }, (_, index) => (
                <div className="table-skeleton" key={index}>
                  <span className="skeleton-line skeleton-line--title" />
                  <span className="skeleton-line skeleton-line--pill" />
                  <span className="skeleton-line skeleton-line--body" />
                  <span className="skeleton-line skeleton-line--small" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="tables-feedback" role="alert">
              <ServerOff size={40} strokeWidth={1.6} />
              <strong>Não foi possível carregar as mesas</strong>
              <span>{error}</span>
              <button className="button button--primary" onClick={() => void loadTables()}>
                Tentar novamente
              </button>
            </div>
          )}

          {!loading && !error && tables.length === 0 && (
            <div className="tables-feedback">
              <strong>Nenhuma mesa cadastrada</strong>
              <span>Cadastre mesas para iniciar a operação do salão.</span>
            </div>
          )}

          {tables.length > 0 && (
            <div className="tables-grid">
              {tables.map(table => (
                <TableCard
                  key={table.id}
                  table={table}
                  busy={openingTableId === table.id}
                  onClick={() => void handleTableClick(table.id)}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
