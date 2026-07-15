import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Brand } from "../components/Brand";
import { useApp } from "../app/AppContext";

export function LoginPage() {
  const navigate = useNavigate();
  const { setOperator } = useApp();
  const [username, setUsername] = useState("Diego");
  const [password, setPassword] = useState("1234");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!username.trim() || !password.trim()) return;
    setOperator(username.trim());
    navigate("/abrir-caixa");
  }

  return (
    <main className="login-page">
      <section className="login-hero">
        <Brand light />
        <div className="login-hero__copy">
          <span className="eyebrow eyebrow--light">Frontend v1.0</span>
          <h1>Operação rápida. Café como protagonista.</h1>
          <p>Uma interface desenhada para reduzir cliques, acelerar o atendimento e simplificar a rotina da cafeteria.</p>
        </div>
        <div className="hero-metrics">
          <div><strong>&lt;10s</strong><span>Meta por venda</span></div>
          <div><strong>3</strong><span>Cliques máximos</span></div>
          <div><strong>100+</strong><span>Produtos pesquisáveis</span></div>
        </div>
      </section>

      <section className="login-form-area">
        <form className="login-card" onSubmit={submit}>
          <Brand />
          <h2>Bem-vindo de volta</h2>
          <p>Entre para iniciar a operação do caixa.</p>

          <div className="demo-note"><b>Demonstração:</b> use os dados preenchidos.</div>

          <label>
            Usuário
            <input value={username} onChange={event => setUsername(event.target.value)} />
          </label>

          <label>
            Senha
            <input type="password" value={password} onChange={event => setPassword(event.target.value)} />
          </label>

          <button className="button button--primary button--large" type="submit">Entrar no sistema</button>
        </form>
      </section>
    </main>
  );
}
