// src/components/QRCodeWrapper.jsx
import { useEffect, useState } from "react";

export default function QRCodeWrapper({ value, size = 192 }) {
  const [QRCode, setQRCode] = useState(null);

  useEffect(() => {
    import("qrcode.react").then((mod) => {
      setQRCode(() => mod.default || mod.QRCode);
    });
  }, []); 

  if (!QRCode) return <p className="text-zinc-400">Cargando QR...</p>;

  return <QRCode value={value} size={size} />;
}
