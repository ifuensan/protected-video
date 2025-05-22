import type { APIRoute } from "astro";
import axios from "axios";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { pubkey, file } = await request.json();

    if (!file) {
      return new Response("Missing file", { status: 400 });
    }

    // 1. Crear invoice
    const createRes = await axios.post(
      `${import.meta.env.BTCPAY_URL}/api/v1/stores/${import.meta.env.BTCPAY_STORE_ID}/invoices`,
      {
        amount: 2000,
        currency: "SATS",
        metadata: { pubkey, file },
      },
      {
        headers: {
          Authorization: `token ${import.meta.env.BTCPAY_API_KEY}`,
        },
      }
    );

    const invoiceId = createRes.data.id;

    // 2. Obtener detalles de métodos de pago (para extraer bolt11)
    const paymentMethodsRes = await axios.get(
      `${import.meta.env.BTCPAY_URL}/api/v1/stores/${import.meta.env.BTCPAY_STORE_ID}/invoices/${invoiceId}/payment-methods`,
      {
        headers: {
          Authorization: `token ${import.meta.env.BTCPAY_API_KEY}`,
        },
      }
    );

  const paymentLink = paymentMethodsRes.data.find(
    (m) => m.paymentMethodId === "BTC-LN"
  )?.paymentLink || null;


    /*console.log("🔍 Full invoice details:", JSON.stringify(invoiceRes.data, null, 2));*/
    console.log("🧾 Invoice created:", JSON.stringify(createRes.data, null, 2));
    console.log("💳 Payment methods:", JSON.stringify(paymentMethodsRes.data, null, 2));
  
    return new Response(
      JSON.stringify({
        invoiceId,
        checkoutUrl: createRes.data.checkoutLink,
        paymentLink,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("BTCPay error:", err?.response?.data || err?.message);
    return new Response(
      JSON.stringify({ error: "BTCPay invoice failed" }),
      { status: 500 }
    );
  }
};
