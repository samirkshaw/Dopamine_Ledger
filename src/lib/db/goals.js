import { supabase } from '../supabaseClient.js';

async function uid() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user.id;
}

function fromRow(g) {
  return {
    id: g.id, title: g.title, targetCount: g.target_count,
    unit: g.unit, weekStart: g.week_start, createdAt: g.created_at,
  };
}

export async function listGoalsForWeek(weekStartDateStr) {
  const { data, error } = await supabase.from('goals').select('*')
    .eq('week_start', weekStartDateStr).order('created_at');
  if (error) throw error;
  return data.map(fromRow);
}

export async function createGoal({ title, targetCount, unit, weekStart }) {
  const user_id = await uid();
  const { data, error } = await supabase.from('goals').insert({
    user_id, title, target_count: targetCount, unit: unit || '', week_start: weekStart,
  }).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateGoalRow(id, updates) {
  const row = {};
  if (updates.title !== undefined) row.title = updates.title;
  if (updates.targetCount !== undefined) row.target_count = updates.targetCount;
  if (updates.unit !== undefined) row.unit = updates.unit;
  const { error } = await supabase.from('goals').update(row).eq('id', id);
  if (error) throw error;
}

export async function deleteGoalRow(id) {
  const { error } = await supabase.from('goals').delete().eq('id', id);
  if (error) throw error;
}
