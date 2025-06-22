import React, { useState } from "react";
import { QrReader } from "react-qr-reader";

export default function QRCodeScanner({ onResult }) {
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  const handleScan = (result) => {
    if (result?.text) {
      setScanResult(result.text);
      onResult && onResult(result.text); // callback para retornar ao pai
    }
  };

  const handleError = (err) => {
    console.error("Erro ao ler QR code:", err);
    setError("Erro ao acessar a câmera ou ler o QR Code.");
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Escaneie o QR Code do Cupom</h3>
      <div style={styles.readerContainer}>
        <QrReader
          constraints={{ facingMode: "environment" }} // câmera traseira em mobile
          onResult={handleScan}
          onError={handleError}
          style={{ width: "100%" }}
        />
      </div>
      {scanResult && <p style={styles.result}>Resultado: {scanResult}</p>}
      {error && <p style={styles.error}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    padding: 20,
    backgroundColor: "#f8fafc",
  },
  title: {
    fontSize: "20px",
    marginBottom: 10,
    color: "#1e293b",
  },
  readerContainer: {
    maxWidth: "400px",
    margin: "0 auto",
    border: "2px solid #cbd5e1",
    borderRadius: "10px",
    overflow: "hidden",
  },
  result: {
    marginTop: 15,
    color: "#16a34a",
    fontWeight: "bold",
  },
  error: {
    color: "#dc2626",
    marginTop: 10,
  },
};
