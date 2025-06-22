import React, { useState } from "react";

export default function CompanyLogo({ logoURL, alt = "Logotipo da empresa", size = 100 }) {
  const [erroImagem, setErroImagem] = useState(false);

  if (!logoURL || erroImagem) {
    return (
      <div
        style={{
          width: size,
          height: size,
          backgroundColor: "#ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#666",
          fontSize: size * 0.3,
          borderRadius: 8,
          userSelect: "none",
        }}
      >
        Sem Logo
      </div>
    );
  }

  return (
    <img
      src={logoURL}
      alt={alt}
      width={size}
      height={size}
      style={{
        objectFit: "contain",
        borderRadius: 8,
        boxShadow: "0 0 6px rgba(0,0,0,0.1)",
      }}
      onError={() => setErroImagem(true)}
    />
  );
}
