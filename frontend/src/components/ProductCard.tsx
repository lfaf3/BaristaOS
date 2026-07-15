import { Star } from "lucide-react";
import type { Product } from "../types";
import { formatCurrency } from "../utils/currency";

export function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  return (
    <button className="product-card" onClick={onAdd}>
      {product.favorite && <Star className="product-card__favorite" size={15} fill="currentColor" />}
      <span className="product-card__code">{product.code} · {product.category}</span>
      <strong>{product.name}</strong>
      <span className="product-card__price">{formatCurrency(product.price)}</span>
    </button>
  );
}
