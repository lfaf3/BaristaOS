import {Navigate,Outlet} from "react-router-dom";import {useAuth} from "../../app/AuthContext";import {FullPageLoader} from "../feedback/FullPageLoader";
export function GuestRoute(){const{status}=useAuth();if(status==="loading")return <FullPageLoader label="Carregando..."/>;if(status==="authenticated")return <Navigate to="/abrir-caixa" replace/>;return <Outlet/>;}
