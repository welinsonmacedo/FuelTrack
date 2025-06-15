import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const navigate = useNavigate();

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <Sidebar onNavigate={path => navigate(path)} />
      <main style={{ flex: 1, padding: 40, backgroundColor: "#ecf0f1", overflowY: "auto" }}>
        {children}
      </main>
    </div>
  );
}
