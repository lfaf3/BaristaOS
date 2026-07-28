import { Printer, X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { OrderHistoryDetail } from "../services/api/order-history.service";
import { ReceiptPrint } from "./ReceiptPrint";
import "./print.css";

interface PrintModalProps {
  order: OrderHistoryDetail;
  onClose: () => void;
}

export function PrintModal({ order, onClose }: PrintModalProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("print-preview-open");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("print-preview-open");
    };
  }, [onClose]);

  function handlePrint() {
    const previousTitle = document.title;
    const attendance = order.table ? (order.table.name ?? `Mesa-${order.table.number}`) : "Balcao";
    document.title = `DM-CAFFE-Comanda-${attendance}`;

    const restoreTitle = () => {
      document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    };

    window.addEventListener("afterprint", restoreTitle);
    window.print();

    // Alguns navegadores não disparam afterprint ao cancelar a impressão.
    window.setTimeout(() => {
      if (document.title !== previousTitle) document.title = previousTitle;
      window.removeEventListener("afterprint", restoreTitle);
    }, 1500);
  }

  return createPortal(
    <div className="print-portal">
      <div className="print-modal-backdrop" role="presentation" onMouseDown={onClose}>
        <section
          className="print-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="print-modal-title"
          onMouseDown={event => event.stopPropagation()}
        >
          <header className="print-modal__header no-print">
            <div>
              <span className="eyebrow">Pré-visualização</span>
              <h2 id="print-modal-title">Comanda para impressão</h2>
              <p>Formato otimizado para bobina térmica de 80 mm.</p>
            </div>
            <button type="button" className="history-modal-close" onClick={onClose} aria-label="Fechar pré-visualização">
              <X size={20} />
            </button>
          </header>

          <div className="print-modal__body">
            <div className="receipt-preview-shell">
              <ReceiptPrint order={order} />
            </div>
          </div>

          <footer className="print-modal__footer no-print">
            <button type="button" className="button button--soft" onClick={onClose}>Fechar</button>
            <button type="button" className="button button--primary" onClick={handlePrint}>
              <Printer size={17} /> Imprimir
            </button>
          </footer>
        </section>
      </div>

      {/*
        Cópia independente usada somente pelo navegador durante a impressão.
        Ela não herda altura, rolagem ou overflow do modal de pré-visualização.
      */}
      <div className="print-document" aria-hidden="true">
        <ReceiptPrint order={order} />
      </div>
    </div>,
    document.body
  );
}
