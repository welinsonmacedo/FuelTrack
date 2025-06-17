import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Sidebar vai se posicionar sozinha via CSS */}
      <Sidebar
        aberto={menuAberto}
        onToggle={() => setMenuAberto(!menuAberto)}
        onNavigate={(path) => {
          navigate(path);
          setMenuAberto(false); // fecha após navegação
        }}
      />

      {/* Conteúdo principal */}
      <main
        style={{
          flexGrow: 1,
          padding: "10px",
          backgroundColor: "#ecf0f1",
          overflowY: "auto",
          height: "100vh",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {children}
      </main>
    </div>
  );
}
