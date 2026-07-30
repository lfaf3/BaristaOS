import {
  Banknote,
  Grid2X2,
  LayoutDashboard,
  Package,
  Plus,
  Settings
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { CafeBrand } from "./CafeBrand";

function navClass({ isActive }: { isActive: boolean }) {
  return `nav-item${isActive ? " nav-item--active" : ""}`;
}

export function Sidebar() {
  return (
    <aside className="sidebar">
      <CafeBrand />

      <nav className="sidebar__nav">
        <NavLink to="/dashboard" className={navClass}>
          <LayoutDashboard size={19} />
          Dashboard
        </NavLink>

        <NavLink to="/mesas" className={navClass}>
          <Grid2X2 size={19} />
          Mesas
        </NavLink>

        <NavLink to="/venda" className={navClass}>
          <Plus size={19} />
          Nova venda
        </NavLink>

        <NavLink to="/pedidos" className={navClass}>
          <Package size={19} />
          Pedidos
        </NavLink>

        <button className="nav-item" type="button" disabled>
          <Banknote size={19} />
          Caixa
        </button>

        <NavLink to="/configuracoes" className={navClass}>
          <Settings size={19} />
          Configurações
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        BaristaOS v3.3.6
        <br />
        Sistema para cafeterias
      </div>
    </aside>
  );
}
