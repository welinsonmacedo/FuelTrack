import { Route } from "react-router-dom";
import Login from "../pages/login/Login";

const publicRoutes = (
  <>
    <Route path="/" element={<Login />} />
  </>
);

export default publicRoutes;
