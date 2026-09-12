import { supabase } from '../supabaseClient.js';

async function uid() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user.id;
}

export async function listHabits() {
  const { data, error } = await supabase.from('habits').select('*').order('sort_order');
  if (error) throw error;
  return data.map(h => ({
    id: h.id,
    name: h.name,
    icon: h.icon,
    weight: h.weight ?? 1,
    targetAmount: h.target_amount != null ? Number(h.target_amount) : null,
    unit: h.unit || null,
  }));
}

export async function createHabit({ name, icon, weight, targetAmount, unit }) {
  const user_id = await uid();
  const row = { user_id, name, icon };
  if (weight !== undefined && weight !== null) row.weight = weight;
  if (targetAmount !== undefined) row.target_amount = targetAmount ? Number(targetAmount) : null;
  if (unit !== undefined) row.unit = unit?.trim() || null;
  const { data, error } = await supabase.from('habits').insert(row).select().single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    icon: data.icon,
    weight: data.weight ?? 1,
    targetAmount: data.target_amount != null ? Number(data.target_amount) : null,
    unit: data.unit || null,
  };
}

export async function updateHabitRow(id, { name, icon, weight, targetAmount, unit }) {
  const fields = { name, icon };
  if (weight !== undefined && weight !== null) fields.weight = weight;
  if (targetAmount !== undefined) fields.target_amount = targetAmount ? Number(targetAmount) : null;
  if (unit !== undefined) fields.unit = unit?.trim() || null;
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
  return data.map(h => ({
    id: h.id,
    name: h.name,
    icon: h.icon,
    weight: h.weight ?? 1,
    targetAmount: h.target_amount != null ? Number(h.target_amount) : null,
    unit: h.unit || null,
  }));
}

// Logs store numeric amounts (default 1 for simple habits, or custom amount for quantified habits).
// Absence of a row means 0 / unlogged. Loaded as { [date]: { [habitId]: amount } }.
export async function listLogs() {
  const { data, error } = await supabase.from('habit_logs').select('habit_id, log_date, amount');
  if (error) throw error;
  const logs = {};
  for (const row of data) {
    if (!logs[row.log_date]) logs[row.log_date] = {};
    logs[row.log_date][row.habit_id] = Number(row.amount ?? 1);
  }
  return logs;
}

export async function setLogAmount(habitId, dateStr, amount) {
  const user_id = await uid();
  const amt = Number(amount);
  if (!amt || amt <= 0) {
    const { error } = await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('log_date', dateStr);
    if (error) throw error;
  } else {
    const { error } = await supabase.from('habit_logs').upsert({
      user_id,
      habit_id: habitId,
      log_date: dateStr,
      amount: amt,
    }, { onConflict: 'habit_id,log_date' });
    if (error) throw error;
  }
}

export async function setLogDone(habitId, dateStr, done) {
  return setLogAmount(habitId, dateStr, done ? 1 : 0);
}
