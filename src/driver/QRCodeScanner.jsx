/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function QRCodeScanner({ onResult }) {
  const scannerRef = useRef(null);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5QrcodeScanner("reader", {
        fps: 10,
        qrbox: 250,
        rememberLastUsedCamera: true,
      });

      scannerRef.current.render(
        (decodedText) => {
          setScanResult(decodedText);
          onResult && onResult(decodedText);
          scannerRef.current.clear().catch(console.error); // parar scanner após leitura
        },
        (scanError) => {
          console.warn("Erro ao escanear:", scanError);
          // Não define erro aqui porque falhas contínuas são esperadas durante a leitura
        }
      );
    }

    return () => {
      scannerRef.current?.clear().catch(console.error);
    };
  }, [onResult]);

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Escaneie o QR Code do Cupom</h3>
      <div id="reader" style={styles.readerContainer}></div>

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
