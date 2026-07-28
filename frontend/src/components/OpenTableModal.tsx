import { Coffee, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

interface OpenTableModalProps {
  open: boolean;
  submitting: boolean;
  error: string | null;
  defaultIdentifier: string;
  onClose: () => void;
  onConfirm: (identifier: string) => void;
}

const suggestions = ["Mesa ", "Balcão", "Delivery", "iFood", "Retirada"];

export function OpenTableModal({ open, submitting, error, defaultIdentifier, onClose, onConfirm }: OpenTableModalProps) {
  const [identifier, setIdentifier] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setIdentifier("");
      setValidationError(null);
    }
  }, [open]);

  if (!open) return null;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onConfirm(identifier.trim());
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={event => {
      if (event.target === event.currentTarget && !submitting) onClose();
    }}>
      <form className="open-table-modal" role="dialog" aria-modal="true" aria-labelledby="open-table-title" onSubmit={submit}>
        <header className="open-table-modal__header">
          <div className="open-table-modal__icon"><Coffee size={23} /></div>
          <div>
            <span className="eyebrow">Novo atendimento</span>
            <h2 id="open-table-title">Identificar atendimento</h2>
          </div>
          <button type="button" className="order-icon-button" aria-label="Fechar" disabled={submitting} onClick={onClose}><X size={18} /></button>
        </header>

        <div className="open-table-modal__body">
          <label>
            <span>Identificação personalizada (opcional)</span>
            <input
              autoFocus
              maxLength={30}
              value={identifier}
              disabled={submitting}
              placeholder={`Em branco: ${defaultIdentifier}`}
              onChange={event => {
                setIdentifier(event.target.value);
                if (validationError) setValidationError(null);
              }}
            />
            <small>{identifier.length}/30 — deixe em branco para usar <strong>{defaultIdentifier}</strong></small>
          </label>
          <div className="open-table-modal__suggestions" aria-label="Sugestões rápidas">
            {suggestions.map(suggestion => (
              <button key={suggestion} type="button" disabled={submitting} onClick={() => setIdentifier(suggestion)}>{suggestion.trim()}</button>
            ))}
          </div>
          {(validationError || error) && <div className="form-error" role="alert">{validationError || error}</div>}
        </div>

        <footer className="open-table-modal__actions">
          <button type="button" className="button button--soft" disabled={submitting} onClick={onClose}>Voltar</button>
          <button type="submit" className="button button--primary" disabled={submitting}>{submitting ? "Abrindo..." : "Abrir atendimento"}</button>
        </footer>
      </form>
    </div>
  );
}
