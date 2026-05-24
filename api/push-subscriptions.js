import { createClient } from '@supabase/supabase-js';

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return json(res, 500, { error: 'Push database env variables are missing.' });

  const { userId, subscription, endpoint, userAgent } = req.body || {};
  if (!subscription || !endpoint) return json(res, 400, { error: 'Invalid subscription payload.' });

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { error } = await supabase.from('taskflow_push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint,
      subscription,
      user_agent: userAgent || '',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' }
  );

  if (error) return json(res, 500, { error: error.message });
  return json(res, 200, { ok: true });
}
