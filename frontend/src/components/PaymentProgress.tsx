import { AlertTriangle, Check, CheckCircle2, CreditCard, LoaderCircle } from "lucide-react";
import type { PaymentEvent, PaymentSession, PaymentStatus } from "../services/api/payment.service";

interface Props {
  status: PaymentStatus;
  message: string;
  provider: string;
  authorizationCode: string | null;
  session: PaymentSession;
}

const labels: Record<PaymentStatus, string> = {
  CREATED: "Iniciando pagamento...", WAITING_DEVICE: "Aguardando PinPad...", CARD_INSERTED: "Cartão inserido",
  PROCESSING: "Processando...", AUTHORIZED: "Pagamento autorizado", CONFIRMED: "Confirmando venda...",
  FINISHED: "Venda concluída", CANCELLED: "Pagamento cancelado", FAILED: "Pagamento não autorizado",
  TIMEOUT: "Tempo de pagamento esgotado", COMMUNICATION_ERROR: "Erro de comunicação"
};

const processingStatuses: PaymentStatus[] = ["CREATED", "WAITING_DEVICE", "CARD_INSERTED", "PROCESSING", "CONFIRMED"];

export function PaymentProgress({ status, message, provider, authorizationCode, session }: Props) {
  const failed = ["FAILED", "CANCELLED", "TIMEOUT", "COMMUNICATION_ERROR"].includes(status);
  const processing = processingStatuses.includes(status);
  return (
    <div className={failed ? "tef-state tef-state--error" : "tef-state"}>
      {processing && (status === "WAITING_DEVICE" || status === "CARD_INSERTED" ? <CreditCard className="spinner" size={58} /> : <LoaderCircle className="spinner" size={58} />)}
      {status === "AUTHORIZED" && <div className="approved-icon"><Check size={36} /></div>}
      {status === "FINISHED" && <div className="approved-icon"><CheckCircle2 size={36} /></div>}
      {failed && <div className="declined-icon"><AlertTriangle size={34} /></div>}
      <h3>{labels[status]}</h3><p>{message}</p>

      <dl className="payment-session-details">
        <div><dt>Sessão</dt><dd>{session.sessionId}</dd></div>
        <div><dt>Operadora</dt><dd>{provider}</dd></div>
        <div><dt>Valor</dt><dd>{session.amount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</dd></div>
      </dl>

      <ol className="payment-timeline" aria-label="Linha do tempo do pagamento">
        {session.events.map((event: PaymentEvent, index: number) => {
          const current = index === session.events.length - 1 && processing;
          return <li key={`${event.timestamp}-${index}`} className={current ? "payment-timeline__current" : ""}>
            <span>{current ? "⏳" : "✓"}</span>
            <div><strong>{event.message}</strong><time>{new Date(event.timestamp).toLocaleTimeString("pt-BR")}</time></div>
          </li>;
        })}
      </ol>

      {authorizationCode && <dl className="payment-transaction-details"><div><dt>Autorização</dt><dd>{authorizationCode}</dd></div></dl>}
    </div>
  );
}
