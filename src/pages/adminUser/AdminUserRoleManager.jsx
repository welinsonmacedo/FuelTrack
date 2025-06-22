import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useUser } from "../../contexts/UserContext.jsx";

const styles = {
  container: {
    maxWidth: 900,
    margin: "20px auto",
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    fontFamily: "'Inter', sans-serif",
    color: "#222",
  },
  title: {
    marginBottom: 20,
    fontSize: 24,
    fontWeight: "700",
    borderBottom: "2px solid #1976d2",
    paddingBottom: 8,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "12px 16px",
    backgroundColor: "#1976d2",
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #ddd",
    fontSize: 14,
  },
  select: {
    padding: "6px 10px",
    borderRadius: 4,
    border: "1px solid #bbb",
    fontSize: 14,
    cursor: "pointer",
    backgroundColor: "#fff",
    color: "#222",
    minWidth: 120,
  },
  noAccess: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 18,
    color: "#999",
  },
  card: {
    backgroundColor: "#f7f9fc",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
  },
  cardRow: {
    marginBottom: 8,
    fontSize: 14,
  },
  cardLabel: {
    fontWeight: "600",
    marginRight: 6,
  },
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 600);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobile;
}

export default function AdminUserRoleManager() {
  const { user } = useUser();
  const [usuarios, setUsuarios] = useState([]);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user?.tipo !== "admin") return;

    async function fetchUsuarios() {
      const snapshot = await getDocs(collection(db, "usuarios"));
      setUsuarios(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    }
    fetchUsuarios();
  }, [user]);

  async function alterarTipo(id, novoTipo) {
    const confirmado = window.confirm("Tem certeza que deseja alterar o tipo do usuário?");
    if (!confirmado) return;

    await updateDoc(doc(db, "usuarios", id), { tipo: novoTipo });
    setUsuarios((prev) => prev.map((u) => (u.id === id ? { ...u, tipo: novoTipo } : u)));
  }

  if (user?.tipo !== "admin")
    return <p style={styles.noAccess}>Você não tem acesso a essa página.</p>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Gerenciar Tipos de Usuário</h2>

      {!isMobile && (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Usuário</th>
              <th style={styles.th}>Email</th>
              <th style={styles.th}>Tipo</th>
              <th style={styles.th}>Alterar Tipo</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map(({ id, nome, email, tipo }) => (
              <tr key={id}>
                <td style={styles.td}>{nome || id}</td>
                <td style={styles.td}>{email}</td>
                <td style={styles.td}>{tipo}</td>
                <td style={styles.td}>
                  <select
                    style={styles.select}
                    value={tipo}
                    onChange={(e) => alterarTipo(id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="padrao">Padrão</option>
                    <option value="motorista">Motorista</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {isMobile && (
        <div>
          {usuarios.map(({ id, nome, email, tipo }) => (
            <div key={id} style={styles.card}>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Usuário:</span> {nome || id}
              </div>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Email:</span> {email}
              </div>
              <div style={styles.cardRow}>
                <span style={styles.cardLabel}>Tipo:</span> {tipo}
              </div>
              <div style={styles.cardRow}>
                <select
                  style={styles.select}
                  value={tipo}
                  onChange={(e) => alterarTipo(id, e.target.value)}
                >
                  <option value="admin">Admin</option>
                  <option value="padrao">Padrão</option>
                  <option value="motorista">Motorista</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
