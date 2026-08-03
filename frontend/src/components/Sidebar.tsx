import {
  Banknote,
  BookOpen,
  Boxes,
  Grid2X2,
  LayoutDashboard,
  Package,
  Plus,
  Settings,
  CreditCard,
  ShoppingCart,
  Truck
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

        <NavLink to="/estoque" className={navClass}>
          <Boxes size={19} />
          Estoque
        </NavLink>

        <NavLink to="/fornecedores" className={navClass}>
          <Truck size={19} />
          Fornecedores
        </NavLink>

        <NavLink to="/compras" className={navClass}>
          <ShoppingCart size={19} />
          Compras
        </NavLink>

        <NavLink to="/fichas-tecnicas" className={navClass}>
          <BookOpen size={19} />
          Fichas técnicas
        </NavLink>

        <button className="nav-item" type="button" disabled>
          <Banknote size={19} />
          Caixa
        </button>

        <NavLink to="/configuracoes" className={navClass}>
          <Settings size={19} />
          Configurações
        </NavLink>
        <NavLink to="/configuracoes/pagamentos" className={navClass}>
          <CreditCard size={19} />
          Pagamentos
        </NavLink>
      </nav>

      <div className="sidebar__footer">
        BaristaOS v3.4.0
        <br />
        Sistema para cafeterias
      </div>
    </aside>
  );
}
