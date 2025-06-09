import { useState, useEffect } from "react";
import VideoPlayer from "./VideoPlayer";
import QRCodeWrapper from "./QRCodeWrapper";

export default function PayToUnlock({ file, title, description, hotmartUrl }) { // Add hotmartUrl prop
  const [invoice, setInvoice] = useState(null);
  const [paid, setPaid] = useState(false);

  const createInvoice = async () => {
    const res = await fetch("/api/pay", {
      method: "POST",
      body: JSON.stringify({ file }),
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    setInvoice({
      id: data.invoiceId,
      url: data.checkoutUrl,
      paymentLink: data.paymentLink,
    });
  };

  useEffect(() => {
    if (!invoice || paid) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/invoice-status?id=${invoice.id}`);
      const data = await res.json();
      if (data.status === "Settled") {
        setPaid(true);
        clearInterval(interval);
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
            className="bg-brand text-white px-4 py-2 rounded hover:bg-orange-600 w-full"
          >
            Pagar con Lightning ⚡ 1000 Sats
          </button>
        </div>
      )}

      {/* Rest of the component remains the same */}
      {invoice && (
        <div className="flex justify-center mt-4">
          <QRCodeWrapper value={invoice.paymentLink} size={192} />
        </div>
      )}

      {invoice && (
        <div className="mt-4 text-sm text-zinc-300 text-center">
          <p className="mb-1">O copia la invoice:</p>
          <div className="flex gap-2 items-center justify-center">
            <input
              type="text"
              value={invoice.paymentLink}
              readOnly
              className="bg-zinc-900 text-zinc-200 px-2 py-1 rounded w-full max-w-sm text-xs truncate"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(invoice.paymentLink);
              }}
              className="bg-orange-600 text-white px-2 py-1 text-xs rounded hover:bg-orange-500"
            >
              Copiar
            </button>
          </div>
        </div>
      )}

      {invoice && !paid && (
        <p className="text-center text-sm text-zinc-400 mt-2 animate-pulse">
          Esperando el pago... ⚡
        </p>
      )}
    </div>
  );
}
