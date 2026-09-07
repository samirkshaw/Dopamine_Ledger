import { supabase } from '../supabaseClient.js';

async function uid() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user.id;
}

// ---------- Categories ----------
export async function listNoteCategories() {
  const { data, error } = await supabase.from('note_categories').select('*').order('created_at');
  if (error) throw error;
  return data.map(c => ({ id: c.id, name: c.name, color: c.color }));
}

export async function createNoteCategory({ name, color }) {
  const user_id = await uid();
  const { data, error } = await supabase.from('note_categories').insert({ user_id, name, color }).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, color: data.color };
}

export async function updateNoteCategoryRow(id, updates) {
  const { error } = await supabase.from('note_categories').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteNoteCategoryRow(id) {
  const { error } = await supabase.from('note_categories').delete().eq('id', id);
  if (error) throw error;
}

export async function seedDefaultNoteCategories(defaults) {
  const user_id = await uid();
  const rows = defaults.map(c => ({ user_id, name: c.name, color: c.color }));
  const { data, error } = await supabase.from('note_categories').insert(rows).select();
  if (error) throw error;
  return data.map(c => ({ id: c.id, name: c.name, color: c.color }));
}

// ---------- Notes ----------
function fromRow(n) {
  return {
    id: n.id,
    userId: n.user_id,
    categoryId: n.category_id,
    noteType: n.note_type,
    title: n.title,
    content: n.content || '',
    pinned: n.pinned,
    createdAt: n.created_at,
    updatedAt: n.updated_at,
  };
}

export async function listNotes() {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function createNote({ title, content, categoryId, noteType = 'note', pinned = false }) {
  const user_id = await uid();
  const { data, error } = await supabase.from('notes').insert({
    user_id,
    title: title || null,
    content: content || '',
    category_id: categoryId || null,
    note_type: noteType,
    pinned: !!pinned,
  }).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateNoteRow(id, updates) {
  const payload = {};
  if (updates.title !== undefined) payload.title = updates.title || null;
  if (updates.content !== undefined) payload.content = updates.content;
  if (updates.categoryId !== undefined) payload.category_id = updates.categoryId || null;
  if (updates.category_id !== undefined) payload.category_id = updates.category_id || null;
  if (updates.noteType !== undefined) payload.note_type = updates.noteType;
  if (updates.note_type !== undefined) payload.note_type = updates.note_type;
  if (updates.pinned !== undefined) payload.pinned = updates.pinned;

  const { error } = await supabase.from('notes').update(payload).eq('id', id);
  if (error) throw error;
}

export async function deleteNoteRow(id) {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}
