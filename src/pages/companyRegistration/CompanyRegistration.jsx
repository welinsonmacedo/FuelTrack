import React, { useEffect, useState } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../../services/firebase";

const empresaDocId = "wRqTco9QV6ctTb75Rhq5"; // ID fixo do documento da empresa

export default function CompanyRegistration() {
  const [form, setForm] = useState({
    nome: "",
    cnpj: "",
    endereco: "",
    telefone: "",
    email: "",
    logoURL: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchEmpresa() {
      try {
        const docRef = doc(db, "empresa", empresaDocId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setForm(docSnap.data());
        }
      } catch (error) {
        alert("Erro ao carregar dados da empresa: " + error.message);
      } finally {
        setLoading(false);
      }
    }
    fetchEmpresa();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const newErrors = {};
    if (!form.nome) newErrors.nome = "Nome é obrigatório";
    if (!form.cnpj) newErrors.cnpj = "CNPJ é obrigatório";
    else if (!/^\d{14}$/.test(form.cnpj.replace(/\D/g, "")))
      newErrors.cnpj = "CNPJ inválido (14 números)";
    if (!form.endereco) newErrors.endereco = "Endereço é obrigatório";
    if (!form.telefone) newErrors.telefone = "Telefone é obrigatório";
    if (!form.email) newErrors.email = "Email é obrigatório";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Email inválido";
    if (!form.logoURL) newErrors.logoURL = "Link do logotipo é obrigatório";
    else if (!/^https?:\/\/.+\.(jpg|jpeg|png|gif|svg)$/i.test(form.logoURL))
      newErrors.logoURL = "Insira um link válido de imagem (jpg, png, gif, svg)";
    return newErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setSaving(true);
      try {
        const docRef = doc(db, "empresa", empresaDocId);
        await setDoc(docRef, {
          ...form,
          updatedAt: new Date(),
        });
        alert("Dados da empresa salvos com sucesso!");
      } catch (error) {
        alert("Erro ao salvar dados da empresa: " + error.message);
      } finally {
        setSaving(false);
      }
    }
  }

  if (loading) return <p>Carregando dados da empresa...</p>;

  return (
    <div style={{ maxWidth: 480, margin: "2rem auto", padding: "0 1rem" }}>
      <h2>Cadastro da Empresa</h2>
      <form onSubmit={handleSubmit} noValidate>
        {/* Inputs do formulário */}
        <div style={{ marginBottom: 16 }}>
          <label>
            Nome da Empresa:<br />
            <input
              type="text"
              name="nome"
              value={form.nome}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, fontSize: 16 }}
              disabled={saving}
            />
          </label>
          {errors.nome && (
            <p style={{ color: "red", marginTop: 4 }}>{errors.nome}</p>
          )}
        </div>

        {/* Repita para os outros campos */}

        <div style={{ marginBottom: 16 }}>
          <label>
            CNPJ:<br />
            <input
              type="text"
              name="cnpj"
              value={form.cnpj}
              onChange={handleChange}
              placeholder="Somente números"
              maxLength={14}
              style={{ width: "100%", padding: 8, fontSize: 16 }}
              disabled={saving}
            />
          </label>
          {errors.cnpj && (
            <p style={{ color: "red", marginTop: 4 }}>{errors.cnpj}</p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Endereço:<br />
            <input
              type="text"
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              style={{ width: "100%", padding: 8, fontSize: 16 }}
              disabled={saving}
            />
          </label>
          {errors.endereco && (
            <p style={{ color: "red", marginTop: 4 }}>{errors.endereco}</p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Telefone:<br />
            <input
              type="tel"
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              placeholder="(xx) xxxx-xxxx"
              style={{ width: "100%", padding: 8, fontSize: 16 }}
              disabled={saving}
            />
          </label>
          {errors.telefone && (
            <p style={{ color: "red", marginTop: 4 }}>{errors.telefone}</p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Email:<br />
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="email@exemplo.com"
              style={{ width: "100%", padding: 8, fontSize: 16 }}
              disabled={saving}
            />
          </label>
          {errors.email && (
            <p style={{ color: "red", marginTop: 4 }}>{errors.email}</p>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label>
            Link do Logotipo:<br />
            <input
              type="url"
              name="logoURL"
              value={form.logoURL}
              onChange={handleChange}
              placeholder="https://exemplo.com/logo.png"
              style={{ width: "100%", padding: 8, fontSize: 16 }}
              disabled={saving}
            />
          </label>
          {errors.logoURL && (
            <p style={{ color: "red", marginTop: 4 }}>{errors.logoURL}</p>
          )}
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: "#2563EB",
            color: "white",
            padding: "12px 24px",
            fontSize: 18,
            border: "none",
            borderRadius: 6,
            cursor: saving ? "not-allowed" : "pointer",
            width: "100%",
            opacity: saving ? 0.6 : 1,
          }}
          disabled={saving}
        >
          {saving ? "Salvando..." : form.nome ? "Salvar Alterações" : "Cadastrar Empresa"}
        </button>
      </form>
    </div>
  );
}
