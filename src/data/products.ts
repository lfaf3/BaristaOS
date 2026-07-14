import type { Product } from "../types";

export const products: Product[] = [
  { id: 1, code: "1001", name: "Espresso", category: "Cafés", price: 5, aliases: ["expresso", "cafe curto"], favorite: true },
  { id: 2, code: "1002", name: "Espresso Duplo", category: "Cafés", price: 8, aliases: ["duplo"], favorite: true },
  { id: 3, code: "1003", name: "Cappuccino", category: "Cafés", price: 9, aliases: ["cap", "capp"], favorite: true },
  { id: 4, code: "1004", name: "Cappuccino Italiano", category: "Cafés", price: 12, aliases: ["cap italiano"] },
  { id: 5, code: "1005", name: "Latte", category: "Cafés", price: 10, aliases: ["cafe latte"] },
  { id: 6, code: "1006", name: "Mocha", category: "Cafés", price: 12, aliases: ["moca"] },
  { id: 7, code: "1007", name: "Café Coado", category: "Cafés", price: 7, aliases: ["coado"] },
  { id: 8, code: "1008", name: "Macchiato", category: "Cafés", price: 8, aliases: ["mac"] },

  { id: 9, code: "2001", name: "Pão de Queijo", category: "Salgados", price: 7, aliases: ["pq", "pao", "queijo"], favorite: true },
  { id: 10, code: "2002", name: "Croissant", category: "Salgados", price: 14, aliases: ["croa"], favorite: true },
  { id: 11, code: "2003", name: "Coxinha", category: "Salgados", price: 9, aliases: ["cox"] },
  { id: 12, code: "2004", name: "Empada de Frango", category: "Salgados", price: 10, aliases: ["empada"] },
  { id: 13, code: "2005", name: "Quiche Lorraine", category: "Salgados", price: 16, aliases: ["quiche"] },

  { id: 14, code: "3001", name: "Brownie", category: "Doces", price: 10, aliases: ["brown"] },
  { id: 15, code: "3002", name: "Bolo de Cenoura", category: "Doces", price: 9, aliases: ["cenoura"] },
  { id: 16, code: "3003", name: "Torta de Limão", category: "Doces", price: 13, aliases: ["torta limao"] },
  { id: 17, code: "3004", name: "Cheesecake", category: "Doces", price: 15, aliases: ["cheese"] },

  { id: 18, code: "4001", name: "Água Mineral", category: "Bebidas", price: 5, aliases: ["agua"] },
  { id: 19, code: "4002", name: "Água com Gás", category: "Bebidas", price: 6, aliases: ["agua gas"] },
  { id: 20, code: "4003", name: "Suco de Laranja", category: "Bebidas", price: 10, aliases: ["suco", "laranja"] },
  { id: 21, code: "4004", name: "Refrigerante", category: "Bebidas", price: 7, aliases: ["refri"] },

  { id: 22, code: "5001", name: "Combo Espresso + PQ", category: "Combos", price: 11, aliases: ["combo pq"] },
  { id: 23, code: "5002", name: "Combo Cappuccino + Croissant", category: "Combos", price: 21, aliases: ["combo cap"] },

  { id: 24, code: "6001", name: "Café Gelado", category: "Gelados", price: 12, aliases: ["gelado", "iced coffee"] },
  { id: 25, code: "6002", name: "Frappé de Chocolate", category: "Gelados", price: 16, aliases: ["frappe"] }
];

export const categories = ["Favoritos", "Todos", "Cafés", "Salgados", "Doces", "Bebidas", "Combos", "Gelados"];
