import { createClient } from '@supabase/supabase-js';

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return json(res, 405, { error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return json(res, 500, { error: 'Push database env variables are missing.' });
  }

  const { userId, subscription, endpoint, userAgent } = req.body || {};

  if (!userId) {
    return json(res, 400, {
      error: 'Missing userId.',
      receivedUserId: userId ?? null,
    });
  }

  if (!subscription || !endpoint) {
    return json(res, 400, { error: 'Invalid subscription payload.' });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Important: remove old row for same browser/phone endpoint first.
  // Then insert fresh row with current guest/login user_id.
  const { error: deleteError } = await supabase
    .from('taskflow_push_subscriptions')
    .delete()
    .eq('endpoint', endpoint);

  if (deleteError) {
    return json(res, 500, {
      error: 'Failed to remove old push subscription.',
      details: deleteError.message,
    });
  }

  const { data, error } = await supabase
    .from('taskflow_push_subscriptions')
    .insert({
      user_id: userId,
      endpoint,
      subscription,
      user_agent: userAgent || '',
      updated_at: new Date().toISOString(),
    })
    .select('user_id, endpoint, user_agent, created_at, updated_at')
    .single();

  if (error) {
    return json(res, 500, {
      error: 'Failed to save push subscription.',
      details: error.message,
      receivedUserId: userId,
    });
  }

  return json(res, 200, {
    ok: true,
    savedUserId: data.user_id,
    userAgent: data.user_agent,
    updatedAt: data.updated_at,
  });
}