const { loadEnvConfig } = require('@next/env');
const { createClient } = require('@supabase/supabase-js');

const projectDir = process.cwd();
loadEnvConfig(projectDir);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.log('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

async function run() {
  console.log('Testing donation insert...');
  const { data, error } = await supabase
    .from('donations')
    .insert({
      campaign_id: '00000000-0000-0000-0000-000000000000', // dummy uuid
      donor_email: 'test@example.com',
      amount_paid: 100,
      tip_amount: 15,
      paystack_fee: 5,
      net_received: 80,
      reference: 'test_ref_123',
      status: 'pending'
    })
    .select('id');

  console.log('Insertion result:', JSON.stringify(error, null, 2));
}

run();
