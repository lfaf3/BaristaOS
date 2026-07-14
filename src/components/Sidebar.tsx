import {
  Banknote,
  Grid2X2,
  Package,
  Plus,
  Settings
} from "lucide-react";

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar__brand">BaristaOS</div>

      <nav className="sidebar__nav">
        <button className="nav-item nav-item--active">
          <Grid2X2 size={19} />
          Mesas
        </button>

        <button className="nav-item">
          <Plus size={19} />
          Nova venda
        </button>

        <button className="nav-item">
          <Package size={19} />
          Pedidos
        </button>

        <button className="nav-item">
          <Banknote size={19} />
          Caixa
        </button>

        <button className="nav-item">
          <Settings size={19} />
          Configurações
        </button>
      </nav>

      <div className="sidebar__footer">
        BaristaOS v1.1
        <br />
        Sistema para cafeterias
      </div>
    </aside>
  );
}