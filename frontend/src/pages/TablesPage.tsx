import { useNavigate } from "react-router-dom";
import { useApp } from "../app/AppContext";
import { Sidebar } from "../components/Sidebar";
import { TableCard } from "../components/TableCard";
import { Topbar } from "../components/Topbar";

export function TablesPage() {
  const navigate = useNavigate();
  const { tables, setSelectedTable, setCounterSale } = useApp();

  function openTable(number: number) {
    setSelectedTable(number);
    setCounterSale(false);
    navigate("/venda");
  }

  function openCounter() {
    setSelectedTable(null);
    setCounterSale(true);
    navigate("/venda");
  }

  const free = tables.filter(table => table.status === "free").length;
  const open = tables.filter(table => table.status === "open").length;
  const payment = tables.filter(table => table.status === "payment").length;

  return (
    <main className="dashboard-layout">
      <Sidebar />
      <section className="dashboard-main">
        <Topbar
          actions={<button className="button button--soft" onClick={openCounter}>Venda balcão</button>}
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

          <div className="tables-grid">
            {tables.map(table => (
              <TableCard key={table.number} table={table} onClick={() => openTable(table.number)} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
