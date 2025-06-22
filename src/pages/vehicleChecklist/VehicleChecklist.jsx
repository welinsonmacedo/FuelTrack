import React, { useState } from "react";

const placasVeiculos = [
  "ABC-1234",
  "DEF-5678",
  "GHI-9012",
  "JKL-3456",
  "MNO-7890",
]; // substitua pelos dados reais

const checklistItems = [
  "Pneus",
  "Estepe",
  "Farol Baixo",
  "Farol Alto",
  "Luz de Freio",
  "Luz de Seta",
  "Luz de Ré",
  "Pisca Alerta",
  "Sistema de Freios",
  "Fluido de Freio",
  "Nível do Óleo",
  "Vazamentos de Óleo",
  "Licenciamento",
  "Seguro",
  "Vidros e Retrovisores",
  "Limpeza Interna",
  "Limpeza Externa",
  "Cintos de Segurança",
  "Bateria",
  "Suspensão",
  "Sistema Elétrico",
  "Extintor",
  "Itens de Emergência",
];

export default function VehicleChecklistWithDefects() {
  const [placaSelecionada, setPlacaSelecionada] = useState("");
  const [checklist, setChecklist] = useState(() => {
    const initial = {};
    checklistItems.forEach((item) => {
      initial[item] = { status: "ok", descricao: "" };
    });
    return initial;
  });

  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);

  const handlePlacaChange = (e) => {
    setPlacaSelecionada(e.target.value);
  };

  const handleStatusChange = (item, status) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: { ...prev[item], status, descricao: status === "ok" ? "" : prev[item].descricao },
    }));
  };

  const handleDescricaoChange = (item, value) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: { ...prev[item], descricao: value },
    }));
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setPhotoFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!placaSelecionada) {
      setMessage("Por favor, selecione a placa do veículo.");
      return;
    }

    if (!photoFile) {
      setMessage("Por favor, envie uma foto do veículo.");
      return;
    }
    setUploading(true);

    // Aqui implemente upload e gravação no Firebase

    console.log("Placa:", placaSelecionada);
    console.log("Checklist enviado:", checklist);
    console.log("Foto:", photoFile);

    setMessage("Checklist enviado com sucesso!");
    setChecklist(() => {
      const reset = {};
      checklistItems.forEach((item) => {
        reset[item] = { status: "ok", descricao: "" };
      });
      return reset;
    });
    setPlacaSelecionada("");
    setPhotoFile(null);
    setUploading(false);
  };

  // Estilos (pode reaproveitar os anteriores)
  const styles = {
    container: {
      maxWidth: 720,
      margin: "2rem auto",
      padding: "1.5rem 2rem",
      backgroundColor: "#fff",
      borderRadius: 12,
      boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#333",
    },
    title: {
      textAlign: "center",
      fontSize: "2rem",
      marginBottom: "1.5rem",
      color: "#2563EB",
      fontWeight: "700",
    },
    select: {
      width: "100%",
      padding: "10px 14px",
      fontSize: 16,
      borderRadius: 8,
      border: "1px solid #cbd5e1",
      marginBottom: 24,
      outline: "none",
      cursor: "pointer",
      transition: "border-color 0.3s ease",
    },
    selectFocus: {
      borderColor: "#2563EB",
      boxShadow: "0 0 6px #2563EBaa",
    },
    // restante dos estilos iguais do checklist
    itemContainer: {
      marginBottom: 20,
      paddingBottom: 15,
      borderBottom: "1px solid #e2e8f0",
    },
    itemTitle: {
      fontWeight: 600,
      fontSize: "1.1rem",
      marginBottom: 6,
      color: "#1e293b",
    },
    radioGroup: {
      display: "flex",
      gap: 24,
      marginBottom: 8,
    },
    radioLabel: {
      display: "flex",
      alignItems: "center",
      gap: 6,
      fontSize: 15,
      cursor: "pointer",
      color: "#334155",
    },
    textarea: {
      width: "100%",
      resize: "vertical",
      minHeight: 48,
      borderRadius: 6,
      border: "1px solid #cbd5e1",
      padding: "8px 10px",
      fontSize: 15,
      fontFamily: "inherit",
      color: "#334155",
      transition: "border-color 0.3s ease",
    },
    fileInputLabel: {
      display: "block",
      fontWeight: "600",
      marginTop: 12,
      marginBottom: 6,
      color: "#334155",
    },
    fileInput: {
      display: "block",
      cursor: "pointer",
      fontSize: 15,
      color: "#475569",
    },
    button: {
      marginTop: 20,
      width: "100%",
      backgroundColor: "#2563EB",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      padding: "14px 0",
      fontSize: 17,
      fontWeight: 700,
      cursor: "pointer",
      boxShadow: "0 4px 14px #2563EBaa",
      transition: "background-color 0.3s ease",
    },
    buttonDisabled: {
      backgroundColor: "#94a3b8",
      cursor: "not-allowed",
      boxShadow: "none",
    },
    message: {
      marginTop: 16,
      fontWeight: 600,
      color: "#16a34a",
      textAlign: "center",
    },
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Checklist Completo do Veículo</h2>

      <select
        style={styles.select}
        value={placaSelecionada}
        onChange={handlePlacaChange}
        required
        onFocus={(e) => {
          e.target.style.borderColor = "#2563EB";
          e.target.style.boxShadow = "0 0 6px #2563EBaa";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#cbd5e1";
          e.target.style.boxShadow = "none";
        }}
      >
        <option value="" disabled>
          Selecione a placa do veículo
        </option>
        {placasVeiculos.map((placa) => (
          <option key={placa} value={placa}>
            {placa}
          </option>
        ))}
      </select>

      <form onSubmit={handleSubmit}>
        {checklistItems.map((item) => {
          const current = checklist[item];
          return (
            <div key={item} style={styles.itemContainer}>
              <div style={styles.itemTitle}>{item}</div>
              <div style={styles.radioGroup}>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name={`${item}-status`}
                    value="ok"
                    checked={current.status === "ok"}
                    onChange={() => handleStatusChange(item, "ok")}
                  />
                  Ok
                </label>
                <label style={styles.radioLabel}>
                  <input
                    type="radio"
                    name={`${item}-status`}
                    value="defeito"
                    checked={current.status === "defeito"}
                    onChange={() => handleStatusChange(item, "defeito")}
                  />
                  Defeito
                </label>
              </div>
              {current.status === "defeito" && (
                <textarea
                  placeholder="Descreva o defeito"
                  value={current.descricao}
                  onChange={(e) => handleDescricaoChange(item, e.target.value)}
                  rows={2}
                  style={styles.textarea}
                  required
                  onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                  onBlur={(e) => (e.target.style.borderColor = "#cbd5e1")}
                />
              )}
            </div>
          );
        })}

        <label style={styles.fileInputLabel}>
          Foto do veículo:
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={styles.fileInput}
            required
          />
        </label>

        <button
          type="submit"
          disabled={uploading}
          style={{ ...styles.button, ...(uploading ? styles.buttonDisabled : {}) }}
        >
          {uploading ? "Enviando..." : "Enviar Checklist"}
        </button>
      </form>
      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
}
