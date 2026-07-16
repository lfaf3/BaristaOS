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

export type TableStatus = "free" | "open" | "payment";

export interface CafeTable {
  number: number;
  status: TableStatus;
  amount: number;
  minutes: number;
  people: number;
  items: number;
}
