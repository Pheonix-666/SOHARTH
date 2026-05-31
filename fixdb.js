const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://ylqnpfalmtgeganpomkq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlscW5wZmFsbXRnZWdhbnBvbWtxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDIwMjI5NCwiZXhwIjoyMDk1Nzc4Mjk0fQ.n6_rC9JWVLSpt_BE8nITVIKHzSL70eQLndhvhfgWvfY'
);

async function fix() {
  const { data, error } = await supabase.from('products').select('*');
  if (error) {
    console.error('Error fetching:', error);
    return;
  }

  for (const product of data) {
    let needsUpdate = false;
    let newImage = product.image;
    
    if (newImage && newImage.includes('E:\\')) {
      newImage = '/WhatsApp Image 2026-05-29 at 12.50.11 PM.jpeg'; // fallback
      needsUpdate = true;
    }

    if (needsUpdate) {
      console.log('Fixing product:', product.id);
      await supabase.from('products').update({ image: newImage }).eq('id', product.id);
    }
  }
  console.log('Done!');
}

fix();
