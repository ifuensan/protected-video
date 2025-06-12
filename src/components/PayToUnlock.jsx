import { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import QRCodeWrapper from "./QRCodeWrapper";

export default function PayToUnlock({ file, title, description, hotmartUrl }) {
  const [invoice, setInvoice] = useState(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  const createInvoice = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        body: JSON.stringify({ file }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      
      // Extraer el invoice Lightning sin el prefijo "lightning:"
      const lightningInvoice = data.paymentLink.replace("lightning:", "");
      
      setInvoice({
        id: data.invoiceId,
        url: data.checkoutUrl,
        paymentLink: data.paymentLink,
        lightningInvoice: lightningInvoice, // Invoice limpio para QR
      });
    } catch (error) {
      console.error("Error creating invoice:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!invoice || paid) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/invoice-status?id=${invoice.id}`);
        const data = await res.json();
        if (data.status === "Settled") {
          setPaid(true);
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Error checking invoice status:", error);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [invoice, paid]);

  if (paid) {
    return <VideoPlayer file={file} />;
  }

  return (
    <div className="bg-zinc-800 p-4 rounded shadow max-w-xl mx-auto">
      <h2 className="text-xl font-bold mb-2 text-brand">{title}</h2>
      <p className="text-sm text-zinc-300 mb-4">{description}</p>
      
      {!invoice && (
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={createInvoice}
            disabled={loading}
            className="bg-brand text-white px-4 py-2 rounded hover:bg-orange-600 w-full disabled:opacity-50"
          >
            {loading ? "Generando invoice..." : "Pagar con Lightning ⚡ 1000 Sats"}
          </button>
          
          {/* Botón opcional para Hotmart */}
          {hotmartUrl && (
            <a
              href={hotmartUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full text-center"
            >
              Pagar con Hotmart 💳
            </a>
          )}
        </div>
      )}

      {invoice && (
        <div className="space-y-4">
          {/* QR Code usando el invoice limpio */}
          <div className="flex justify-center">
            <QRCodeWrapper value={invoice.lightningInvoice} size={256} />
          </div>
          
          {/* Invoice para copiar */}
          <div className="text-sm text-zinc-300 text-center">
            <p className="mb-2">Escanea el QR o copia la invoice:</p>
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={invoice.lightningInvoice}
                readOnly
                className="bg-zinc-900 text-zinc-200 px-2 py-1 rounded flex-1 text-xs font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(invoice.lightningInvoice);
                }}
                className="bg-orange-600 text-white px-3 py-1 text-xs rounded hover:bg-orange-500 whitespace-nowrap"
              >
                Copiar
              </button>
            </div>
          </div>
          
          {/* Estado del pago */}
          {!paid && (
            <p className="text-center text-sm text-zinc-400 animate-pulse">
              Esperando el pago... ⚡
            </p>
          )}
        </div>
      )}
    </div>
  );
}
