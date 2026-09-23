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

/**
 * Fetch past-week goals + their completed tasks, bounded by `limit` distinct weeks.
 * @param {string} currentWeekStart - Monday of the current week (ISO date string).
 * @param {number} limit - Max number of distinct past weeks to return (default 10).
 * @param {number} offset - Number of distinct past weeks to skip (for pagination).
 * @returns {{ weeks: Array<{weekStart, goals, doneTasks}>, hasMore: boolean }}
 */
export async function listGoalHistory(currentWeekStart, limit = 10, offset = 0) {
  // 1. Fetch past goals (week_start < current week), ordered most-recent-first.
  //    We over-fetch rows to cover limit+1 distinct weeks so we can detect hasMore.
  const { data: goalRows, error: gErr } = await supabase.from('goals').select('*')
    .lt('week_start', currentWeekStart)
    .order('week_start', { ascending: false });
  if (gErr) throw gErr;
  if (!goalRows || goalRows.length === 0) return { weeks: [], hasMore: false };

  // 2. Extract distinct week_starts, apply offset + limit.
  const allWeekStarts = [...new Set(goalRows.map(g => g.week_start))];
  // Already sorted desc because the query was ordered desc.
  const sliced = allWeekStarts.slice(offset, offset + limit);
  const hasMore = allWeekStarts.length > offset + limit;

  if (sliced.length === 0) return { weeks: [], hasMore: false };

  // 3. Filter goals to only the selected weeks.
  const slicedSet = new Set(sliced);
  const filteredGoals = goalRows.filter(g => slicedSet.has(g.week_start));
  const goalIds = filteredGoals.map(g => g.id);

  // 4. Fetch done tasks linked to those goals (single round-trip).
  let doneTasks = [];
  if (goalIds.length > 0) {
    const { data: taskRows, error: tErr } = await supabase.from('tasks').select('id, goal_id, goal_contribution')
      .in('goal_id', goalIds)
      .eq('done', true);
    if (tErr) throw tErr;
    doneTasks = taskRows || [];
  }

  // 5. Group into week objects.
  const weeks = sliced.map(ws => ({
    weekStart: ws,
    goals: filteredGoals.filter(g => g.week_start === ws).map(g => ({
      id: g.id, title: g.title, targetCount: g.target_count, unit: g.unit,
    })),
    doneTasks: doneTasks.filter(t => filteredGoals.some(g => g.id === t.goal_id && g.week_start === ws)).map(t => ({
      id: t.id, goalId: t.goal_id, goalContribution: t.goal_contribution,
    })),
  }));

  return { weeks, hasMore };
}
