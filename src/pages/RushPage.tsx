import { ArrowLeft, Command, Search, Table2 } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../app/AppContext";
import { CartPanel } from "../components/CartPanel";
import { PaymentModal } from "../components/PaymentModal";
import { ProductCard } from "../components/ProductCard";
import { Topbar } from "../components/Topbar";
import { categories, products } from "../data/products";

export function RushPage() {
  const navigate = useNavigate();
  const {
    selectedTable,
    counterSale,
    addProduct,
    cart,
    completeSale
  } = useApp();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Favoritos");
  const [paymentOpen, setPaymentOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const contextLabel = counterSale
    ? "Balcão"
    : selectedTable
      ? `Mesa ${String(selectedTable).padStart(2, "0")}`
      : "Nova venda";

  const filteredProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery) {
      return products.filter(product =>
        [product.name, product.code, product.category, ...product.aliases]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      );
    }

    if (category === "Todos") return products;
    if (category === "Favoritos") return products.filter(product => product.favorite);
    return products.filter(product => product.category === category);
  }, [category, query]);

  useEffect(() => {
    searchRef.current?.focus();

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "F2") {
        event.preventDefault();
        searchRef.current?.focus();
      }

      if (event.key === "F4") {
        event.preventDefault();
        navigate("/mesas");
      }

      if (event.key === "F9") {
        event.preventDefault();
        if (cart.length > 0) setPaymentOpen(true);
      }

      if (event.key === "Escape") {
        if (paymentOpen) setPaymentOpen(false);
        else navigate("/mesas");
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [cart.length, navigate, paymentOpen]);

  function handleSearchKey(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && filteredProducts[0]) {
      addProduct(filteredProducts[0]);
      setQuery("");
    }
  }

  function finishSale() {
    completeSale();
    setPaymentOpen(false);
    navigate("/mesas");
  }

  return (
    <main className="page-shell rush-page">
      <Topbar
        actions={
          <button className="button button--soft" onClick={() => navigate("/mesas")}>
            <ArrowLeft size={17} /> Mesas
          </button>
        }
      />

      <section className="rush-layout">
        <div className="rush-products">
          <div className="rush-toolbar">
            <div className="sale-context">
              <span className="sale-context__icon"><Table2 size={21} /></span>
              <span><small>ATENDIMENTO</small><strong>{contextLabel}</strong></span>
            </div>

            <div className="search-box">
              <Search size={19} />
              <input
                ref={searchRef}
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={handleSearchKey}
                placeholder="Pesquisar por nome, código ou apelido..."
              />
              <kbd>F2</kbd>
            </div>

            <button className="button button--soft"><Command size={17} /> Atalhos</button>
          </div>

          <div className="category-strip">
            {categories.map(item => (
              <button
                key={item}
                className={category === item ? "category-chip category-chip--active" : "category-chip"}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="products-grid">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} onAdd={() => addProduct(product)} />
            ))}

            {filteredProducts.length === 0 && (
              <div className="empty-search">
                <Search size={38} />
                <strong>Nenhum produto encontrado</strong>
                <span>Tente outro nome, código ou apelido.</span>
              </div>
            )}
          </div>
        </div>

        <CartPanel onFinish={() => cart.length > 0 && setPaymentOpen(true)} />
      </section>

      <footer className="shortcut-bar">
        <span><b>F2</b> Pesquisar</span>
        <span><b>F4</b> Mesas</span>
        <span><b>F6</b> Observação</span>
        <span><b>F9</b> Finalizar</span>
        <span><b>ESC</b> Voltar</span>
      </footer>

      <PaymentModal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        onComplete={finishSale}
      />
    </main>
  );
}
