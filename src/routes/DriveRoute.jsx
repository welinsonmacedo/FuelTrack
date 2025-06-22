import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function DriverRoute({ children }) {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.tipo !== "motorista") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
