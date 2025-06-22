import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db, storage } from "../../services/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
  const { viagemId } = useParams();
  const [placa, setPlaca] = useState("");
  const [marca, setMarca] = useState("");
  const [modelo, setModelo] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [checklist, setChecklist] = useState(() => {
    const initial = {};
    checklistItems.forEach((item) => {
      initial[item] = { status: "ok", descricao: "" };
    });
    return initial;
  });

  useEffect(() => {
    if (viagemId) {
      const fetchViagem = async () => {
        try {
          const viagemRef = doc(db, "viagens", viagemId);
          const viagemSnap = await getDoc(viagemRef);

          if (viagemSnap.exists()) {
            const viagemData = viagemSnap.data();

            if (viagemData.caminhao) {
              const caminhaoRef = doc(db, "veiculos", viagemData.caminhao);
              const caminhaoSnap = await getDoc(caminhaoRef);

              if (caminhaoSnap.exists()) {
                const caminhaoData = caminhaoSnap.data();
                setPlaca(caminhaoData.placa || "");
                setModelo(caminhaoData.modelo);
                setMarca(caminhaoData.marca);
              } else {
                setPlaca("Placa não encontrada");
              }
            } else {
              setPlaca("Caminhão não vinculado");
            }
          } else {
            setPlaca("Viagem não encontrada");
          }
        } catch (error) {
          setMessage("Erro ao buscar dados: " + error.message);
        }
      };

      fetchViagem();
    }
  }, [viagemId]);

  const handleStatusChange = (item, status) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        status,
        descricao: status === "ok" ? "" : prev[item].descricao,
      },
    }));
  };

  const handleDescricaoChange = (item, value) => {
    setChecklist((prev) => ({
      ...prev,
      [item]: {
        ...prev[item],
        descricao: value,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!placa || !photoFile) {
      setMessage("Preencha todos os campos obrigatórios.");
      return;
    }

    setUploading(true);
    try {
      const fileRef = ref(storage, `checklists/${viagemId}/${photoFile.name}`);
      await uploadBytes(fileRef, photoFile);
      const fotoUrl = await getDownloadURL(fileRef);

      await setDoc(doc(db, "checklists", viagemId), {
        viagemId,
        placa,
        marca,
        modelo,
        checklist,
        fotoUrl,
        criadoEm: new Date(),
      });

      setMessage("Checklist enviado com sucesso!");
      setPhotoFile(null);
    } catch (error) {
      setMessage("Erro ao enviar checklist: " + error.message);
    }
    setUploading(false);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Checklist do Veículo</h2>

      <div style={styles.header}>
        <div style={styles.infoBlock}>
          <span style={styles.label}>Placa</span>
          <span style={styles.infoValue}>{placa || "Não encontrada"}</span>
        </div>
        <div style={styles.infoBlock}>
          <span style={styles.label}>Marca</span>
          <span style={styles.infoValue}>{marca || "Não encontrada"}</span>
        </div>
        <div style={styles.infoBlock}>
          <span style={styles.label}>Modelo</span>
          <span style={styles.infoValue}>{modelo || "Não encontrado"}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        {checklistItems.map((item) => (
          <div key={item} style={styles.item}>
            <label style={styles.itemLabel}>{item}</label>
            <div style={styles.radioGroup}>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name={item}
                  value="ok"
                  checked={checklist[item].status === "ok"}
                  onChange={() => handleStatusChange(item, "ok")}
                  style={styles.radioInput}
                />
                Ok
              </label>
              <label style={styles.radioLabel}>
                <input
                  type="radio"
                  name={item}
                  value="defeito"
                  checked={checklist[item].status === "defeito"}
                  onChange={() => handleStatusChange(item, "defeito")}
                  style={styles.radioInput}
                />
                Defeito
              </label>
            </div>
            {checklist[item].status === "defeito" && (
              <textarea
                placeholder="Descreva o defeito"
                value={checklist[item].descricao}
                onChange={(e) => handleDescricaoChange(item, e.target.value)}
                style={styles.textarea}
                rows={2}
                required
              />
            )}
          </div>
        ))}

        <div style={styles.fileInputContainer}>
          <label style={styles.labelFile}>Foto do veículo:</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setPhotoFile(e.target.files[0])}
            style={styles.fileInput}
            required
          />
        </div>

        <button type="submit" disabled={uploading} style={uploading ? {...styles.button, ...styles.buttonDisabled} : styles.button}>
          {uploading ? "Enviando..." : "Enviar Checklist"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </form>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: 480,
    margin: "0 auto",
    padding: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
    fontFamily: "'Poppins', sans-serif",
    color: "#1e293b",
    minHeight: "100vh",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    color: "#2563eb",
    textAlign: "center",
  },
  header: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: 32,
    flexWrap: "wrap",
    gap: 16,
  },
  infoBlock: {
    flex: "1 1 30%",
    backgroundColor: "#f1f5f9",
    padding: 12,
    borderRadius: 8,
    boxShadow: "inset 0 0 8px #dbeafe",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  form: {
    textAlign: "left",
  },
  item: {
    marginBottom: 24,
  },
  itemLabel: {
    display: "block",
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 10,
    color: "#334155",
  },
  radioGroup: {
    display: "flex",
    gap: 24,
    marginBottom: 10,
  },
  radioLabel: {
    fontSize: 15,
    color: "#475569",
    cursor: "pointer",
    userSelect: "none",
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  radioInput: {
    cursor: "pointer",
    width: 18,
    height: 18,
  },
  textarea: {
    width: "100%",
    borderRadius: 8,
    border: "1px solid #cbd5e1",
    padding: 10,
    fontSize: 15,
    fontFamily: "'Poppins', sans-serif",
    color: "#334155",
    resize: "vertical",
    boxShadow: "0 0 5px rgba(37, 99, 235, 0.3)",
    transition: "border-color 0.3s ease",
  },
  fileInputContainer: {
    marginTop: 30,
    marginBottom: 30,
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: 8,
  },
  labelFile: {
    fontWeight: "600",
    fontSize: 16,
    color: "#334155",
  },
  fileInput: {
    cursor: "pointer",
    fontSize: 16,
    padding: 8,
    borderRadius: 6,
    border: "1px solid #cbd5e1",
    width: "100%",
    boxSizing: "border-box",
    transition: "border-color 0.3s ease",
  },
  button: {
    width: "100%",
    backgroundColor: "#2563eb",
    color: "#fff",
    padding: 16,
    fontSize: 18,
    fontWeight: "700",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    boxShadow: "0 6px 15px rgba(37, 99, 235, 0.4)",
    transition: "background-color 0.3s ease",
  },
  buttonDisabled: {
    backgroundColor: "#94a3b8",
    cursor: "not-allowed",
    boxShadow: "none",
  },
  message: {
    marginTop: 20,
    fontWeight: "700",
    fontSize: 16,
    color: "#16a34a",
    textAlign: "center",
  },
};
