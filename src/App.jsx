import { Routes } from "react-router-dom";
import publicRoutes from "./routes/PublicRoutes";
import "./App.css"
import privateRoutesMain from "./routes/RoutesMain";
export default function App() {
  return (
    <Routes>
      {publicRoutes}
      {privateRoutesMain}
    </Routes>
  );
}
