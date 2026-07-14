import { Navigate, Route, Routes } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { OpenCashPage } from "../pages/OpenCashPage";
import { TablesPage } from "../pages/TablesPage";
import { RushPage } from "../pages/RushPage";
import { AppProvider } from "./AppContext";

export function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/abrir-caixa" element={<OpenCashPage />} />
        <Route path="/mesas" element={<TablesPage />} />
        <Route path="/venda" element={<RushPage />} />
      </Routes>
    </AppProvider>
  );
}
