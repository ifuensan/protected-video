import { useEffect, useState } from "react";

export default function QRCodeWrapper({ value, size = 192 }) {
  const [QRCode, setQRCode] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Importar dinámicamente qrcode.react
    import("qrcode.react")
      .then((mod) => {
        setQRCode(() => mod.default || mod.QRCode);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading QRCode library:", err);
        setError("Error cargando generador de QR");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center bg-zinc-700 rounded"
        style={{ width: size, height: size }}
      >
        <p className="text-zinc-400">Cargando QR...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center bg-zinc-700 rounded text-center p-4"
        style={{ width: size, height: size }}
      >
        <p className="text-zinc-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!QRCode) {
    return (
      <div 
        className="flex items-center justify-center bg-zinc-700 rounded"
        style={{ width: size, height: size }}
      >
        <p className="text-zinc-400">Error al cargar QR</p>
      </div>
    );
  }

  if (!value) {
    return (
      <div 
        className="flex items-center justify-center bg-zinc-700 rounded"
        style={{ width: size, height: size }}
      >
        <p className="text-zinc-400">Sin datos</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded">
      <QRCode 
        value={value} 
        size={size}
        level="M"
        includeMargin={false}
      />
    </div>
  );
}