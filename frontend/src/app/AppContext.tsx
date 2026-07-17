import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { CafeTable, CartItem, PaymentMethod, Product } from "../types";

interface AppState {
  operator: string;
  setOperator: (name: string) => void;
  selectedTable: number | null;
  setSelectedTable: (number: number | null) => void;
  counterSale: boolean;
  setCounterSale: (value: boolean) => void;
  tables: CafeTable[];
  setTables: React.Dispatch<React.SetStateAction<CafeTable[]>>;
  cart: CartItem[];
  addProduct: (product: Product) => void;
  changeQuantity: (productId: number, delta: number) => void;
  clearCart: () => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (method: PaymentMethod) => void;
  subtotal: number;
  itemCount: number;
  completeSale: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [operator, setOperator] = useState("Diego");
  const [selectedTable, setSelectedTable] = useState<number | null>(null);
  const [counterSale, setCounterSale] = useState(false);
  const [tables, setTables] = useState<CafeTable[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Dinheiro");

  function addProduct(product: Product) {
    setCart(current => {
      const found = current.find(item => item.id === product.id);
      if (found) {
        return current.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...current, { ...product, quantity: 1 }];
    });
  }

  function changeQuantity(productId: number, delta: number) {
    setCart(current =>
      current
        .map(item =>
          item.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.price * item.quantity, 0),
    [cart]
  );

  const itemCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  function completeSale() {
    if (selectedTable) {
      setTables(current =>
        current.map(table =>
          table.number === selectedTable
            ? { ...table, status: "free", amount: 0, minutes: 0, people: 0, items: 0 }
            : table
        )
      );
    }
    clearCart();
    setPaymentMethod("Dinheiro");
    setSelectedTable(null);
    setCounterSale(false);
  }

  return (
    <AppContext.Provider
      value={{
        operator,
        setOperator,
        selectedTable,
        setSelectedTable,
        counterSale,
        setCounterSale,
        tables,
        setTables,
        cart,
        addProduct,
        changeQuantity,
        clearCart,
        paymentMethod,
        setPaymentMethod,
        subtotal,
        itemCount,
        completeSale
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp deve ser usado dentro de AppProvider.");
  return context;
}
