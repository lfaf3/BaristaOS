export type PaymentMethod = "Dinheiro" | "PIX" | "TEF";

export type Product = {
  id: number;
  code: string;
  name: string;
  category: string;
  price: number;
  aliases: string[];
  favorite?: boolean;
};

export type CartItem = Product & {
  quantity: number;
};

export type TableStatus = "free" | "open" | "payment" | "blocked";

export interface CafeTable {
  id: string;
  number: number;
  name: string | null;
  status: TableStatus;
  seats: number;
  amount: number;
  minutes: number;
  people: number;
  items: number;
}

export interface TableOrderItem {
  id: string;
  productId: string;
  code: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  notes: string | null;
}

export interface TableOrder {
  table: {
    id: string;
    number: number;
    name: string | null;
    status: "OPEN" | "PAYMENT";
    seats: number;
    people: number;
    openedAt: string | null;
    minutesOpen: number;
  };
  order: {
    id: string;
    guestCount: number;
    openedAt: string;
    notes: string | null;
    subtotal: number;
    discount: number;
    serviceChargePercentage: number;
    serviceCharge: number;
    total: number;
  } | null;
  items: TableOrderItem[];
  subtotal: number;
  discount: number;
  serviceChargePercentage: number;
  serviceCharge: number;
  total: number;
}
