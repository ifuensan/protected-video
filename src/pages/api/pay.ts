// src/pages/api/pay.js (o similar)
export async function POST({ request }) {
  try {
    const { file } = await request.json();
    
    // Tu llamada a BTCPayServer API
    const btcPayResponse = await fetch(`${BTCPAY_URL}/api/v1/stores/${STORE_ID}/invoices`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${BTCPAY_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: '2000', // 2000 sats
        currency: 'SATS',
        metadata: {
          file: file
        },
        checkout: {
          speedPolicy: 'MediumSpeed',
          paymentMethods: ['BTC-LN', 'BTC-CHAIN', 'BTC-LNURL'],
          expirationMinutes: 60,
        }
      })
    });

    const invoiceData = await btcPayResponse.json();
    
    // Obtener los métodos de pago
    const paymentMethodsResponse = await fetch(
      `${BTCPAY_URL}/api/v1/stores/${STORE_ID}/invoices/${invoiceData.id}/payment-methods`, 
      {
        headers: {
          'Authorization': `token ${BTCPAY_TOKEN}`,
        }
      }
    );
    
    const paymentMethods = await paymentMethodsResponse.json();
    
    // Buscar el método Lightning (BTC-LN)
    const lightningMethod = paymentMethods.find(method => method.paymentMethodId === 'BTC-LN');
    
    if (!lightningMethod) {
      throw new Error('Lightning payment method not available');
    }

    return new Response(JSON.stringify({
      invoiceId: invoiceData.id,
      checkoutUrl: invoiceData.checkoutLink,
      paymentLink: lightningMethod.paymentLink, // Este ya incluye "lightning:"
      amount: lightningMethod.amount,
      status: invoiceData.status
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Error creating invoice:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to create invoice',
      details: error.message 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}