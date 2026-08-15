import { supabase } from '../supabaseClient.js';

async function uid() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  return user.id;
}

// ---------- Categories ----------
export async function listFinanceCategories() {
  const { data, error } = await supabase.from('finance_categories').select('*').order('created_at');
  if (error) throw error;
  return data.map(c => ({ id: c.id, name: c.name, color: c.color, kind: c.kind }));
}

export async function createFinanceCategory({ name, color, kind }) {
  const user_id = await uid();
  const { data, error } = await supabase.from('finance_categories').insert({ user_id, name, color, kind }).select().single();
  if (error) throw error;
  return { id: data.id, name: data.name, color: data.color, kind: data.kind };
}

export async function updateFinanceCategoryRow(id, updates) {
  const { error } = await supabase.from('finance_categories').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteFinanceCategoryRow(id) {
  const { error } = await supabase.from('finance_categories').delete().eq('id', id);
  if (error) throw error;
}

export async function seedDefaultFinanceCategories(defaults) {
  const user_id = await uid();
  const rows = defaults.map(c => ({ user_id, name: c.name, color: c.color, kind: c.kind }));
  const { data, error } = await supabase.from('finance_categories').insert(rows).select();
  if (error) throw error;
  return data.map(c => ({ id: c.id, name: c.name, color: c.color, kind: c.kind }));
}

// ---------- Transactions ----------
function fromRow(t) {
  return {
    id: t.id, type: t.type, amount: t.amount, category: t.category_id,
    note: t.note, date: t.txn_date, account: t.account,
  };
}

export async function listTransactions() {
  const { data, error } = await supabase.from('transactions').select('*').order('txn_date', { ascending: false });
  if (error) throw error;
  return data.map(fromRow);
}

export async function createTransactionRow(txn) {
  const user_id = await uid();
  const { data, error } = await supabase.from('transactions').insert({
    user_id, type: txn.type, amount: txn.amount, category_id: txn.category || null,
    note: txn.note || null, txn_date: txn.date, account: txn.account,
  }).select().single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateTransactionRow(id, txn) {
  const { error } = await supabase.from('transactions').update({
    type: txn.type, amount: txn.amount, category_id: txn.category || null,
    note: txn.note || null, txn_date: txn.date, account: txn.account,
  }).eq('id', id);
  if (error) throw error;
}

export async function deleteTransactionRow(id) {
  const { error } = await supabase.from('transactions').delete().eq('id', id);
  if (error) throw error;
}

export async function reassignTransactionsCategory(fromCategoryId, toCategoryId) {
  const { error } = await supabase.from('transactions').update({ category_id: toCategoryId }).eq('category_id', fromCategoryId);
  if (error) throw error;
}
