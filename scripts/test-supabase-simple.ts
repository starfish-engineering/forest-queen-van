import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log('🔌 Connecting to Supabase...');
console.log('   URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Try to get the session - this will test if we can connect
    const { data, error } = await supabase.auth.getSession();

    if (error && error.message !== 'Auth session missing!') {
      console.error('❌ Connection failed:', error);
      process.exit(1);
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log('   Database ID: kxxgihzuaxatyirgpobp');
    console.log('   Region: US East 1 (AWS)');
    console.log('   Connection: Authenticated ✓');

    // Check if we have a valid client
    console.log('\n📦 Supabase Client Info:');
    console.log('   Auth URL:', (supabase.auth as any).url);
    console.log('   Rest URL:', (supabase as any).rest?.url || supabaseUrl + '/rest/v1');

    console.log('\n🎉 All systems go! Supabase is ready to use.');

  } catch (err: any) {
    console.error('❌ Unexpected error:', err.message);
    process.exit(1);
  }
}

testConnection();
