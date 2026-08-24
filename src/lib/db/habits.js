import { supabase } from '../supabaseClient.js';

async function uid() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user.id;
}

export async function listHabits() {
  const { data, error } = await supabase.from('habits').select('*').order('sort_order');
  if (error) throw error;
  return data.map(h => ({ id: h.id, name: h.name, icon: h.icon, weight: h.weight ?? 1 }));
}

export async function createHabit({ name, icon, weight }) {
  const user_id = await uid();
  const row = { user_id, name, icon };
  if (weight !== undefined && weight !== null) row.weight = weight;
  const { data, error } = await supabase.from('habits').insert(row).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, icon: data.icon, weight: data.weight ?? 1 };
}

export async function updateHabitRow(id, { name, icon, weight }) {
  const fields = { name, icon };
  if (weight !== undefined && weight !== null) fields.weight = weight;
  const { error } = await supabase.from('habits').update(fields).eq('id', id);
  if (error) throw error;
}

export async function deleteHabitRow(id) {
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderHabits(orderedIds) {
  for (let i = 0; i < orderedIds.length; i++) {
    const { error } = await supabase.from('habits').update({ sort_order: i }).eq('id', orderedIds[i]);
    if (error) throw error;
  }
}

export async function seedDefaultHabits(defaults) {
  const user_id = await uid();
  const rows = defaults.map((h, i) => ({ user_id, name: h.name, icon: h.icon, sort_order: i }));
  const { data, error } = await supabase.from('habits').insert(rows).select();
  if (error) throw error;
  return data.map(h => ({ id: h.id, name: h.name, icon: h.icon, weight: h.weight ?? 1 }));
}

// Logs are stored as one row per (habit, date) done day — presence means
// done. Loaded into the same { [date]: { [habitId]: true } } shape the
// rest of the app already expects, so nothing else has to change.
export async function listLogs() {
  const { data, error } = await supabase.from('habit_logs').select('habit_id, log_date');
  if (error) throw error;
  const logs = {};
  for (const row of data) {
    if (!logs[row.log_date]) logs[row.log_date] = {};
    logs[row.log_date][row.habit_id] = true;
  }
  return logs;
}

export async function setLogDone(habitId, dateStr, done) {
  const user_id = await uid();
  if (done) {
    const { error } = await supabase.from('habit_logs').insert({ user_id, habit_id: habitId, log_date: dateStr });
    if (error) throw error;
  } else {
    const { error } = await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('log_date', dateStr);
    if (error) throw error;
  }
}
