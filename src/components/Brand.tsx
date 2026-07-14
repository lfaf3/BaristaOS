import { Coffee } from "lucide-react";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <div className={`brand ${light ? "brand--light" : ""}`}>
      <span className="brand__mark"><Coffee size={22} strokeWidth={2.4} /></span>
      <span>BaristaOS</span>
    </div>
  );
}
