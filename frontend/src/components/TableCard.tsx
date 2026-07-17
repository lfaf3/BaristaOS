import { Ban, Clock3, LoaderCircle, Package, Users } from "lucide-react";
import type { CafeTable } from "../types";
import { formatCurrency } from "../utils/currency";

interface Props {
  table: CafeTable;
  onClick: () => void;
  busy?: boolean;
}

const statusLabels = {
  free: "Livre",
  open: "Em atendimento",
  payment: "Aguardando pagamento",
  blocked: "Bloqueada"
} as const;

export function TableCard({ table, onClick, busy = false }: Props) {
  const blocked = table.status === "blocked";

  return (
    <button
      className={`table-card table-card--${table.status}`}
      onClick={onClick}
      disabled={blocked || busy}
      aria-busy={busy}
    >
      <div className="table-card__top">
        <strong>{table.name ?? `Mesa ${String(table.number).padStart(2, "0")}`}</strong>
        <span className={`status-pill status-pill--${table.status}`}>
          {busy ? "Abrindo..." : statusLabels[table.status]}
        </span>
      </div>

      {table.status === "free" ? (
        <div className="table-card__empty">
          {busy && <LoaderCircle size={22} className="icon-spin" />}
          <span>{busy ? "Abrindo mesa" : "Disponível"}</span>
          <small>
            {busy ? "Aguarde a confirmação" : `${table.seats} lugares · Clique para iniciar`}
          </small>
        </div>
      ) : blocked ? (
        <div className="table-card__empty table-card__empty--blocked">
          <Ban size={22} />
          <span>Indisponível</span>
          <small>Libere a mesa nas configurações.</small>
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
