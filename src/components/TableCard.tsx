import { Clock3, Package, Users } from "lucide-react";
import type { CafeTable } from "../types";
import { formatCurrency } from "../utils/currency";

interface Props {
  table: CafeTable;
  onClick: () => void;
}

export function TableCard({ table, onClick }: Props) {
  const statusLabel = {
    free: "Livre",
    open: "Em atendimento",
    payment: "Aguardando pagamento"
  }[table.status];

  return (
    <button className={`table-card table-card--${table.status}`} onClick={onClick}>
      <div className="table-card__top">
        <strong>Mesa {String(table.number).padStart(2, "0")}</strong>
        <span className={`status-pill status-pill--${table.status}`}>{statusLabel}</span>
      </div>

      {table.status === "free" ? (
        <div className="table-card__empty">
          <span>Disponível</span>
          <small>Clique para iniciar</small>
        </div>
      ) : (
        <>
          <div className="table-card__amount">{formatCurrency(table.amount)}</div>
          <div className="table-card__meta">
            <span><Users size={14} /> {table.people} pessoas</span>
            <span><Package size={14} /> {table.items} itens</span>
            <span><Clock3 size={14} /> {table.minutes} min</span>
          </div>
        </>
      )}
    </button>
  );
}
