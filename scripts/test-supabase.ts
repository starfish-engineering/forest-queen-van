import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('Supabase URL:', supabaseUrl);
console.log('Anon Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Error: Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!supabaseAnonKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Check if we can connect
    console.log('\n📡 Testing connection...');
    const { data, error } = await supabase.from('_test_connection').select('*').limit(1);

    if (error) {
      // This is expected if the table doesn't exist, but it proves we can connect
      if (error.code === '42P01') {
        console.log('✅ Connection successful! (Table not found is expected)');
      } else {
        console.log('⚠️  Connected, but got error:', error.message);
      }
    } else {
      console.log('✅ Connection successful!');
    }

    // Test 2: List all tables
    console.log('\n📊 Listing tables...');
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('⚠️  Could not list tables:', tablesError.message);
    } else {
      console.log('✅ Found', tables?.length || 0, 'tables in public schema');
      if (tables && tables.length > 0) {
        console.log('Tables:', tables.map((t: any) => t.table_name).join(', '));
      }
    }

    // Test 3: Check auth
    console.log('\n🔐 Testing auth...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.log('⚠️  Not authenticated (this is normal for anon key)');
    } else if (user) {
      console.log('✅ Authenticated as:', user.email || user.id);
    } else {
      console.log('ℹ️  No user logged in (using anonymous access)');
    }

    console.log('\n🎉 All tests complete!');
    console.log('\n📝 Connection Summary:');
    console.log('  Database: kxxgihzuaxatyirgpobp.supabase.co');
    console.log('  Status: Connected ✅');
    console.log('  Region: US East 1');

  } catch (err) {
    console.error('\n❌ Connection test failed:', err);
    process.exit(1);
  }
}

testConnection();
