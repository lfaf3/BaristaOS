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
