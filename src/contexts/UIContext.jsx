/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState } from "react";

const UIContext = createContext();

export function UIProvider({ children }) {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const showAlert = (message, type = "info") => {
    setAlert({ message, type });
    setTimeout(() => setAlert(null), 3000);
  };

  return (
    <UIContext.Provider value={{ showAlert, showLoading, hideLoading }}>
      {children}
      {loading && <div style={loadingStyle}>Carregando...</div>}
      {alert && (
        <div style={{ ...alertStyle, backgroundColor: alertColors[alert.type] }}>
          {alert.message}
        </div>
      )}
    </UIContext.Provider>
  );
}

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error("useUI deve ser usado dentro de um UIProvider");
  }
  return context;
};

// Estilos simples
const loadingStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  background: "#000000aa",
  color: "#fff",
  textAlign: "center",
  padding: "10px",
  zIndex: 9999,
};

const alertStyle = {
  position: "fixed",
  bottom: 20,
  left: "50%",
  transform: "translateX(-50%)",
  padding: "12px 20px",
  borderRadius: "6px",
  color: "#fff",
  fontWeight: "bold",
  zIndex: 10000,
};

const alertColors = {
  info: "#3498db",
  success: "#2ecc71",
  danger: "#e74c3c",
};
