import { AlertTriangle, RefreshCw, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

interface CancelOrderModalProps {
  open: boolean;
  submitting: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

export function CancelOrderModal({
  open,
  submitting,
  error,
  onClose,
  onConfirm
}: CancelOrderModalProps) {
  const [reason, setReason] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setReason("");
      setValidationError(null);
    }
  }, [open]);

  if (!open) return null;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedReason = reason.trim();

    if (normalizedReason.length < 3) {
      setValidationError("Informe um motivo com pelo menos 3 caracteres.");
      return;
    }

    setValidationError(null);
    onConfirm(normalizedReason);
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget && !submitting) onClose();
    }}>
      <form className="cancel-order-modal" role="dialog" aria-modal="true" aria-labelledby="cancel-order-title" onSubmit={handleSubmit}>
        <header className="cancel-order-modal__header">
          <div className="cancel-order-modal__icon"><AlertTriangle size={24} /></div>
          <div>
            <span className="eyebrow">Comanda sem consumo</span>
            <h2 id="cancel-order-title">Cancelar atendimento</h2>
          </div>
          <button type="button" className="order-icon-button" aria-label="Fechar" disabled={submitting} onClick={onClose}>
            <X size={18} />
          </button>
        </header>

        <div className="cancel-order-modal__body">
          <p>Esta ação libera a mesa sem gerar venda ou faturamento. O motivo ficará registrado para auditoria.</p>
          <label>
            <span>Motivo do cancelamento</span>
            <textarea
              autoFocus
              rows={4}
              maxLength={300}
              value={reason}
              disabled={submitting}
              placeholder="Ex.: mesa aberta por engano"
              onChange={event => {
                setReason(event.target.value);
                if (validationError) setValidationError(null);
              }}
            />
            <small>{reason.length}/300</small>
          </label>
          {(validationError || error) && <div className="form-error" role="alert">{validationError || error}</div>}
        </div>

        <footer className="cancel-order-modal__actions">
          <button type="button" className="button button--soft" disabled={submitting} onClick={onClose}>Voltar</button>
          <button type="submit" className="button button--danger" disabled={submitting}>
            {submitting && <RefreshCw size={17} className="icon-spin" />}
            {submitting ? "Cancelando..." : "Confirmar cancelamento"}
          </button>
        </footer>
      </form>
    </div>
  );
}
