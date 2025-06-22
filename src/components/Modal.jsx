import React from "react";
import Button from "../components/Button";
import { useUser } from "../contexts/UserContext"; // ajuste o caminho conforme seu projeto

export default function Modal({ isOpen, onClose, title, children, onEdit, onDelete }) {
   const { user } = useUser()

  if (!isOpen) return null;

  return (
    <div
      style={styles.overlay}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <Button variant="cloose" onClick={onClose}>
            X
          </Button>
        </div>
        {title && (
          <h2 style={styles.title} id="modal-title">
            {title}
          </h2>
        )}
        <div>{children}</div>

        {/* Botões só para admin */}
        {user?.tipo === "admin" && (
          <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
            <Button onClick={onEdit} style={styles.button}>
              Editar
            </Button>
            <Button onClick={onDelete} style={{ ...styles.button, backgroundColor: "#e74c3c" }}>
              Apagar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  modal: {
    backgroundColor: "#ffffff",
    padding: "20px",
    borderRadius: "8px",
    maxWidth: "500px",
    width: "90%",
    boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
  },
  button: {
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: 6,
    border: "none",
    backgroundColor: "#00BCD4",
    color: "white",
  },
  closeBtn: {
    marginTop: "15px",
    padding: "8px 16px",
    cursor: "pointer",
  },
  header: {
    display: "flex",
    justifyContent: "right",
    alignItems: "center",
    marginBottom: "5vh",
  },
  title: {
    margin: "5vh",
  },
};
