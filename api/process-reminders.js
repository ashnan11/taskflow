import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

function json(res, status, body) {
  res.status(status).setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

function reminderKey(userId, taskId, reminder) {
  return `${userId}:${taskId}:${reminder}`;
}

function parseTasks(row) {
  const tasks = row?.data?.tasks;
  return Array.isArray(tasks) ? tasks : [];
}

export default async function handler(req, res) {
  // const cronSecret = process.env.CRON_SECRET;
  // if (cronSecret && req.headers.authorization !== `Bearer ${cronSecret}`) {
  //   return json(res, 401, { error: 'Unauthorized' });
  // }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const vapidPublic = process.env.VAPID_PUBLIC_KEY || process.env.VITE_VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';

  if (!supabaseUrl || !serviceRoleKey || !vapidPublic || !vapidPrivate) {
    return json(res, 500, { error: 'Push env variables are missing.' });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const now = new Date();

  const { data: userRows, error: userError } = await supabase.from('taskflow_user_data').select('user_id,data');
  if (userError) return json(res, 500, { error: userError.message });

  let sent = 0;
  let skipped = 0;

  for (const row of userRows || []) {
    const userId = row.user_id;
    const tasks = parseTasks(row);
    const dueTasks = tasks.filter((task) => {
      if (!task?.reminder || task.isCompleted || task.isArchived) return false;

      const due = new Date(task.reminder);

      const reminderTime = due.getTime();
      const currentTime = now.getTime();

      const diff = Math.abs(currentTime - reminderTime);

      return !Number.isNaN(reminderTime) && diff <= 300000;
    });

    if (!dueTasks.length) continue;

    const { data: subscriptions } = await supabase
      .from('taskflow_push_subscriptions')
      .select('endpoint,subscription')
      .or(`user_id.eq.${userId},user_id.is.null`);

    if (!subscriptions?.length) continue;

    for (const task of dueTasks) {
      const key = reminderKey(userId, task.id, task.reminder);
      const { data: alreadySent } = await supabase
        .from('taskflow_sent_reminders')
        .select('reminder_key')
        .eq('reminder_key', key)
        .maybeSingle();

      if (alreadySent) {
        skipped += 1;
        continue;
      }

      const payload = JSON.stringify({
        title: 'TaskFlow Reminder',
        body: task.title || 'You have a task reminder.',
        taskId: task.id,
        tag: key,
        url: '/',
      });

      for (const sub of subscriptions) {
        try {
          await webpush.sendNotification(sub.subscription, payload);
          sent += 1;
        } catch (error) {
          if (error?.statusCode === 404 || error?.statusCode === 410) {
            await supabase.from('taskflow_push_subscriptions').delete().eq('endpoint', sub.endpoint);
          }
        }
      }

      await supabase.from('taskflow_sent_reminders').upsert({
        reminder_key: key,
        user_id: userId,
        task_id: task.id,
        reminder_at: task.reminder,
        sent_at: new Date().toISOString(),
      });
    }
  }

  return json(res, 200, {
  ok: true,
  sent,
  skipped,
  usersFound: userRows?.length || 0,
  checkedAt: now.toISOString(),
});
}
