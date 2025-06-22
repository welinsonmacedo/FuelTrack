import { Routes } from "react-router-dom";
import publicRoutes from "./routes/PublicRoutes";
import privateRoutes from "./routes/PrivateRoutes";
import "./App.css"
export default function App() {
  return (
    <Routes>
      {publicRoutes}
      {privateRoutes}
    </Routes>
  );
}
