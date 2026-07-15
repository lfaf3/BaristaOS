import type { ReactNode } from "react";
import { Brand } from "./Brand";
import { useApp } from "../app/AppContext";

export function Topbar({ actions }: { actions?: ReactNode }) {
  const { operator } = useApp();

  return (
    <header className="topbar">
      <Brand />
      <div className="topbar__actions">
        {actions}
        <div className="operator">
          <span className="operator__avatar">{operator.charAt(0).toUpperCase()}</span>
          <span>
            <strong>{operator}</strong>
            <small>Operador</small>
          </span>
        </div>
      </div>
    </header>
  );
}
