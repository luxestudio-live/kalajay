import { POST } from '@/app/api/orders/createOrder';

async function testMultiItemOrder() {
  console.log('Testing Multi-Item Order Transaction Ordering (Reads before Writes)...');

  // Payload with multiple distinct items
  const payload = {
    customerName: '[PREPROD TEST] Multi-Item Read Order Fix',
    customerEmail: 'qa-multi-item@kalajay-luxe.theluxestudio.in',
    customerPhone: '9876543210',
    shippingAddress: {
      addressLine: '123 Artisan Workshop Way',
      city: 'Jaipur',
      state: 'Rajasthan',
      pincode: '302001'
    },
    paymentMethod: 'card',
    items: [
      { productId: 'colorful-beaded-airpods-case-kj-apc-402', quantity: 1 },
      { productId: 'crystal-beaded-airpods-case-kj-apc-404', quantity: 1 },
      { productId: 'florescent-beaded-airpods-case-kj-apc-405', quantity: 1 }
    ]
  };

  const req = new Request('http://localhost:3000/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const res = await POST(req);
  const data = await res.json();

  console.log('Response Status:', res.status);
  console.log('Response Body:', data);

  if (res.status === 200 && data.success && data.orderId) {
    console.log(`✅ TEST PASSED: Successfully placed 3-item order ${data.orderId} without transaction read-after-write errors!`);
  } else {
    console.error('❌ TEST FAILED:', data);
    process.exit(1);
  }
}

testMultiItemOrder().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
