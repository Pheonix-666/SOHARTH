const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTable() {
  const { data, error } = await supabase.from('orders').insert({
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    customer: {},
    shipping_address: {},
    order_status: 'Pending',
    payment_status: 'Pending',
    payment_method: 'Cash on Delivery',
    shipping_method: 'Standard',
    tracking_number: '',
    internal_notes: '',
  });
  console.log('Error:', error);
}

checkTable();
