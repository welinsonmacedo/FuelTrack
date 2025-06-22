// src/components/ProtectedFallback.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../contexts/UserContext";

export default function ProtectedFallback() {
  const { user, loading } = useUser();

  if (loading) {
    return <div>Carregando...</div>; // pode ser um loader animado se quiser
  }

  // Se não estiver logado, redireciona para login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redireciona baseado no tipo de usuário
  return <Navigate to={user.tipo === "motorista" ? "/driverdashboard" : "/dashboard"} replace />;
}
