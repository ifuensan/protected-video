import type { APIRoute } from "astro";
import axios from "axios";

export const prerender = false;


export const GET: APIRoute = async ({ url }) => {
  const id = url.searchParams.get("id");
  if (!id) return new Response("Missing id", { status: 400 });

  try {
    const resp = await axios.get(
      `${import.meta.env.BTCPAY_URL}/api/v1/stores/${import.meta.env.BTCPAY_STORE_ID}/invoices/${id}`,
      {
        headers: {
          Authorization: `token ${import.meta.env.BTCPAY_API_KEY}`,
        },
      }
    );

    return new Response(JSON.stringify({ status: resp.data.status }));
  } catch (err) {
    console.error("Invoice status fetch error:", err?.response?.data || err);
    return new Response(JSON.stringify({ status: "error" }), {
      status: 404,
    });
  }
};
