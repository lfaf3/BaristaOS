import { useCompany } from "../app/CompanyContext";

export function CafeBrand() {
  const { company } = useCompany();
  const logo = company?.logoDataUrl ?? "/brands/dm-caffe-sidebar-logo.png";
  const name = company?.displayName || company?.tradeName || "DM Caffè";
  return (
    <div className="cafe-brand">
      <div className="cafe-brand__logo-wrapper">
        <img className="cafe-brand__logo" src={logo} alt={name} />
      </div>
      <span className="cafe-brand__powered">BaristaOS</span>
    </div>
  );
}
