import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Topbar } from "../components/Topbar";

export function OpenCashPage() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("R$ 200,00");

  return (
    <main className="page-shell">
      <Topbar />
      <section className="center-page">
        <div className="open-cash-card">
          <span className="eyebrow">Início do turno</span>
          <h1>Abrir caixa</h1>
          <p>Informe o valor disponível para troco antes de iniciar as vendas.</p>

          <input className="money-input" value={amount} onChange={event => setAmount(event.target.value)} />

          <label>
            Observação opcional
            <input placeholder="Ex.: abertura do turno da manhã" />
          </label>

          <button className="button button--accent button--large" onClick={() => navigate("/mesas")}>
            Abrir caixa e continuar
          </button>
        </div>
      </section>
    </main>
  );
}
