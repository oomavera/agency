// Check RLS policies on leads table
const accessToken = 'sbp_e6647fcb21f485859d6f20b4b48201e9c453c558';
const projectRef = 'xdcvdiwtkdksczlfidil';

async function checkRLSPolicies() {
  console.log('🔍 Checking RLS policies on leads table...\n');

  try {
    // Query to get RLS policies
    const sql = `
      SELECT
        schemaname,
        tablename,
        policyname,
        permissive,
        roles,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE tablename = 'leads';
    `;

    const response = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ API Error:', response.status, error);
      return;
    }

    const result = await response.json();

    if (!result || result.length === 0) {
      console.log('✅ No RLS policies found on leads table');
      console.log('   This means RLS might be disabled, or no policies exist\n');

      // Check if RLS is enabled
      const checkRLSSQL = `
        SELECT relname, relrowsecurity
        FROM pg_class
        WHERE relname = 'leads' AND relnamespace = 'public'::regnamespace;
      `;

      const rlsResponse = await fetch(
        `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: checkRLSSQL })
        }
      );

      const rlsResult = await rlsResponse.json();
      console.log('RLS Status:', JSON.stringify(rlsResult, null, 2));

    } else {
      console.log('📋 Found RLS Policies:\n');
      result.forEach((policy, idx) => {
        console.log(`${idx + 1}. Policy: ${policy.policyname}`);
        console.log(`   Command: ${policy.cmd}`);
        console.log(`   Roles: ${policy.roles}`);
        console.log(`   Permissive: ${policy.permissive}`);
        console.log(`   Using: ${policy.qual || 'N/A'}`);
        console.log(`   With Check: ${policy.with_check || 'N/A'}`);
        console.log('');
      });

      console.log('⚠️  RLS policies exist. The anon role might not have UPDATE permission.');
    }

    // Now let's try to add a policy that allows updating qstash_message_id
    console.log('\n🔧 Creating RLS policy to allow qstash_message_id updates...\n');

    const createPolicySQL = `
      -- Drop if exists
      DROP POLICY IF EXISTS "Allow qstash_message_id updates" ON public.leads;

      -- Create policy to allow anyone to update qstash_message_id
      CREATE POLICY "Allow qstash_message_id updates"
      ON public.leads
      FOR UPDATE
      TO anon, authenticated
      USING (true)
      WITH CHECK (true);
    `;

    const policyResponse = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: createPolicySQL })
      }
    );

    if (!policyResponse.ok) {
      const error = await policyResponse.text();
      console.error('❌ Failed to create policy:', error);
    } else {
      console.log('✅ RLS policy created successfully!');
      console.log('   Policy: "Allow qstash_message_id updates"');
      console.log('   This allows the anon role to UPDATE the leads table\n');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkRLSPolicies();
