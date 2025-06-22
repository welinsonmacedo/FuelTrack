import React, { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import CompanyLogo from "./CompanyLogo";

export default function CompanyInfo() {
  const [empresa, setEmpresa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const empresaDocId = "wRqTco9QV6ctTb75Rhq5";

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        const docRef = doc(db, "empresa", empresaDocId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setEmpresa(docSnap.data());
        } else {
          setError("Dados da empresa não encontrados.");
        }
      } catch (err) {
        setError("Erro ao buscar dados da empresa: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEmpresa();
  }, []);

  if (loading)
    return (
      <p style={{ textAlign: "center", marginTop: 40, fontSize: 18, color: "#555" }}>
        Carregando dados da empresa...
      </p>
    );
  if (error)
    return (
      <p
        style={{
          textAlign: "left",
          marginTop: 40,
          fontSize: 18,
          color: "red",
          fontWeight: "bold",
        }}
      >
        {error}
      </p>
    );
  if (!empresa) return null;

  return (
    <div
      style={{
        maxWidth: 600,
        margin: "3rem auto",
        padding: "2rem",
        backgroundColor: "#fff",
        borderRadius: 12,
        boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        color: "#333",
      }}
    >
      <h2 style={{ marginBottom: 24, textAlign: "center", color: "#2563EB" }}>
        Dados da Empresa
      </h2>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <CompanyLogo logoURL={empresa.logoURL} size={140} />

        <div
          style={{
            minWidth: 280,
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <InfoRow label="Nome" value={empresa.nome} />
          <InfoRow label="CNPJ" value={empresa.cnpj} />
          <InfoRow label="Endereço" value={empresa.endereco} />
          <InfoRow label="Telefone" value={empresa.telefone} />
          <InfoRow label="Email" value={empresa.email} />
        </div>
      </div>
    </div>
  );
}

// Componente para linha de informação
function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        gap:"10px",
        padding: "8px ",
        backgroundColor: "#f9f9f9",
        borderRadius: 8,
        boxShadow: "inset 0 1px 3px rgba(0,0,0,0.06)",
        fontSize: 16,
      
      }}
    >
      <strong style={{ color: "#555" }}>{label}:</strong>
      <span style={{ color: "#030303", wordBreak: "break-word", maxWidth: "100%" ,  textAlign:"left"}}>
        {value}
      </span>
    </div>
  );
}
