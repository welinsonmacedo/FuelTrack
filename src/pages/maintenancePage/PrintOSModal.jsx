import React from "react";
import Button from "../../components/Button";
import Modal from "../../components/Modal";

export default function PrintOSModal({ isOpen, onClose, manutencao, veiculo, tipo, oficina }) {
  if (!isOpen) return null;

  const dataExecucao = manutencao?.dataExecucao
    ? new Date(manutencao.dataExecucao).toLocaleDateString("pt-BR")
    : "Não informada";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ordem de Serviço">
      <div id="os-print-area" style={{ padding: 10 }}>
        <p><strong>Veículo:</strong> {veiculo?.placa} - {veiculo?.modelo}</p>
        <p><strong>Tipo de Manutenção:</strong> {tipo?.nome}</p>
        <p><strong>Data de Execução:</strong> {dataExecucao}</p>
        <p><strong>KM na Execução:</strong> {manutencao?.kmExecucao ?? "Não informado"}</p>
        <p><strong>Oficina Responsável:</strong> {oficina?.razaoSocial?? "Não informada"}</p>
        <p><strong>Observações:</strong></p>
        <p style={{ whiteSpace: "pre-wrap" }}>{manutencao?.observacoes || "Nenhuma"}</p>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20 }}>
        <Button variant="secondary" onClick={onClose}>
          Fechar
        </Button>
        <Button variant="success" onClick={() => window.print()}>
          Imprimir OS
        </Button>
      </div>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #os-print-area, #os-print-area * {
            visibility: visible;
          }
          #os-print-area {
            position: absolute;
            left: 0; top: 0;
            width: 100%;
            background: #ecfc92;
            padding: 20px;
          }
          button {
            display: none;
          }
        }
      `}</style>
    </Modal>
  );
}
