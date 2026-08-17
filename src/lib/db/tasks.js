import { supabase } from '../supabaseClient.js';

async function uid() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user.id;
}

// ---------- Categories ----------
export async function listTaskCategories() {
  const { data, error } = await supabase.from('task_categories').select('*').order('created_at');
  if (error) throw error;
  return data.map(c => ({ id: c.id, name: c.name, color: c.color }));
}

export async function createTaskCategory({ name, color }) {
  const user_id = await uid();
  const { data, error } = await supabase.from('task_categories').insert({ user_id, name, color }).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, color: data.color };
}

export async function updateTaskCategoryRow(id, updates) {
  const { error } = await supabase.from('task_categories').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteTaskCategoryRow(id) {
  const { error } = await supabase.from('task_categories').delete().eq('id', id);
  if (error) throw error;
}

export async function seedDefaultTaskCategories(defaults) {
  const user_id = await uid();
  const rows = defaults.map(c => ({ user_id, name: c.name, color: c.color }));
  const { data, error } = await supabase.from('task_categories').insert(rows).select();
  if (error) throw error;
  return data.map(c => ({ id: c.id, name: c.name, color: c.color }));
}

// ---------- Tasks ----------
function fromRow(t) {
  return {
    id: t.id, title: t.title, due: t.due_date, priority: t.priority,
    category: t.category_id, notes: t.notes, done: t.done, doneAt: t.done_at,
    plannedDate: t.planned_date, createdAt: t.created_at,
  };
}

export async function listTasks() {
  const { data, error } = await supabase.from('tasks').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function createTaskRow(task) {
  const user_id = await uid();
  const { data, error } = await supabase.from('tasks').insert({
    user_id, title: task.title, due_date: task.due || null, priority: task.priority,
    category_id: task.category || null, notes: task.notes || null,
    planned_date: task.plannedDate || null,
  }).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateTaskRow(id, task) {
  const { error } = await supabase.from('tasks').update({
    title: task.title, due_date: task.due || null, priority: task.priority,
    category_id: task.category || null, notes: task.notes || null,
  }).eq('id', id);
  if (error) throw error;
}

export async function setTaskDone(id, done, doneAt) {
  const { error } = await supabase.from('tasks').update({ done, done_at: doneAt }).eq('id', id);
  if (error) throw error;
}

export async function setPlannedDate(id, dateStrOrNull) {
  const { error } = await supabase.from('tasks').update({ planned_date: dateStrOrNull }).eq('id', id);
  if (error) throw error;
}

export async function deleteTaskRow(id) {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function clearCompletedTaskRows() {
  const user_id = await uid();
  const { error } = await supabase.from('tasks').delete().eq('user_id', user_id).eq('done', true);
  if (error) throw error;
}

export async function reassignTasksCategory(fromCategoryId, toCategoryId) {
  const { error } = await supabase.from('tasks').update({ category_id: toCategoryId }).eq('category_id', fromCategoryId);
  if (error) throw error;
}
