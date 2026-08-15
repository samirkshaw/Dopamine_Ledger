import { useMemo } from 'react';
import { Pencil, IndianRupee, TrendingUp, TrendingDown, Wallet, Landmark, Banknote } from 'lucide-react';
import { C } from '../../theme.js';
import { todayStr } from '../../lib/dateHelpers.js';
import { fmtMoney } from '../../lib/format.js';
import { finCatById, last6MonthKeys, monthKey, monthShortLabel } from './financeHelpers.js';
import MoneyStatCard from './MoneyStatCard.jsx';
import InlineAddTransaction from './InlineAddTransaction.jsx';

export default function FinanceTrackerView({ transactions, categories, filterCat, setFilterCat, typeFilter, setTypeFilter, onAdd, onEdit, onManageCats }) {
  const today = todayStr();
  const thisMonth = monthKey(today);

  const filtered = useMemo(() => {
    let f = transactions;
    if (filterCat !== 'all') f = f.filter(t => t.category === filterCat);
    if (typeFilter !== 'all') f = f.filter(t => t.type === typeFilter);
    return f;
  }, [transactions, filterCat, typeFilter]);

  const stats = useMemo(() => {
    let totalIncome = 0, totalExpense = 0, monthIncome = 0, monthExpense = 0;
    let cashBalance = 0, bankBalance = 0;
    for (const t of transactions) {
      const amt = Number(t.amount) || 0;
      const sign = t.type === 'income' ? 1 : -1;
      if ((t.account || 'bank') === 'cash') cashBalance += sign * amt;
      else bankBalance += sign * amt;
      if (t.type === 'income') {
        totalIncome += amt;
        if (monthKey(t.date) === thisMonth) monthIncome += amt;
      } else {
        totalExpense += amt;
        if (monthKey(t.date) === thisMonth) monthExpense += amt;
      }
    }
    const balance = totalIncome - totalExpense;
    const monthNet = monthIncome - monthExpense;
    const savingsRate = monthIncome ? Math.round((monthNet / monthIncome) * 100) : 0;
    return { totalIncome, totalExpense, balance, monthIncome, monthExpense, monthNet, savingsRate, cashBalance, bankBalance };
  }, [transactions, thisMonth]);

  const monthlyBars = useMemo(() => {
    const keys = last6MonthKeys();
    return keys.map(k => {
      let inc = 0, exp = 0;
      for (const t of transactions) {
        if (monthKey(t.date) !== k) continue;
        if (t.type === 'income') inc += Number(t.amount) || 0; else exp += Number(t.amount) || 0;
      }
      return { key: k, label: monthShortLabel(k), inc, exp };
    });
  }, [transactions]);
  const maxBar = Math.max(1, ...monthlyBars.flatMap(b => [b.inc, b.exp]));

  const expenseBreakdown = useMemo(() => {
    const byCategory = {};
    let total = 0;
    for (const t of transactions) {
      if (t.type !== 'expense' || monthKey(t.date) !== thisMonth) continue;
      const amt = Number(t.amount) || 0;
      byCategory[t.category] = (byCategory[t.category] || 0) + amt;
      total += amt;
    }
    return Object.entries(byCategory)
      .map(([catId, amt]) => ({ cat: finCatById(categories, catId), amt, pct: total ? Math.round((amt / total) * 100) : 0 }))
      .sort((a, b) => b.amt - a.amt);
  }, [transactions, categories, thisMonth]);

  const sorted = useMemo(() => [...filtered].sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.id > a.id ? 1 : -1)), [filtered]);

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 18 }}>
        <MoneyStatCard
          label="Balance"
          value={fmtMoney(stats.balance)}
          icon={<Wallet size={14} />}
          tone={stats.balance >= 0 ? C.good : C.bad}
          sub={
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Banknote size={10} /> {fmtMoney(stats.cashBalance)}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}><Landmark size={10} /> {fmtMoney(stats.bankBalance)}</span>
            </span>
          }
        />
        <MoneyStatCard label="Income this month" value={fmtMoney(stats.monthIncome)} icon={<TrendingUp size={14} />} tone={C.good} />
        <MoneyStatCard label="Expenses this month" value={fmtMoney(stats.monthExpense)} icon={<TrendingDown size={14} />} tone={C.bad} />
        <MoneyStatCard label="Savings rate" value={`${stats.savingsRate}%`} icon={<IndianRupee size={14} />} tone={stats.savingsRate >= 20 ? C.good : stats.savingsRate >= 0 ? C.warn : C.bad} />
      </div>

      <InlineAddTransaction categories={categories} onAdd={onAdd} />

      {/* 6-month income vs expense chart */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15 }}>Income vs Expenses</div>
          <div style={{ display: 'flex', gap: 12, fontSize: 10.5, color: C.sub }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.tealDark, display: 'inline-block' }} />Income</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: C.bad, display: 'inline-block' }} />Expenses</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 14, height: 140 }}>
          {monthlyBars.map((b, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: '100%' }}>
                <div title={fmtMoney(b.inc)} style={{ width: 16, height: `${Math.max(2, (b.inc / maxBar) * 100)}%`, background: C.tealDark, borderRadius: '4px 4px 0 0' }} />
                <div title={fmtMoney(b.exp)} style={{ width: 16, height: `${Math.max(2, (b.exp / maxBar) * 100)}%`, background: C.bad, borderRadius: '4px 4px 0 0' }} />
              </div>
              <div style={{ fontSize: 10.5, color: C.sub, fontWeight: 600, marginTop: 6 }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense breakdown by category */}
      {expenseBreakdown.length > 0 && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16, marginBottom: 18 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 15, marginBottom: 4 }}>Where It's Going</div>
          <div style={{ fontSize: 11.5, color: C.sub, marginBottom: 12 }}>Expense breakdown for this month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {expenseBreakdown.map((e, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 110, fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: e.cat.color, fontWeight: 600 }}>{e.cat.name}</div>
                <div style={{ flex: 1, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.10)', overflow: 'hidden' }}>
                  <div style={{ width: `${e.pct}%`, height: '100%', background: e.cat.color }} />
                </div>
                <div style={{ width: 90, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 11.5, color: C.sub }}>{fmtMoney(e.amt)}</div>
                <div style={{ width: 38, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: C.sub }}>{e.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button onClick={() => setTypeFilter('all')} className="hs-btn" style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '6px 12px', borderRadius: 20,
            border: `1.4px solid ${typeFilter === 'all' ? C.chip : C.line}`,
            background: typeFilter === 'all' ? C.chip : 'transparent', color: typeFilter === 'all' ? '#fff' : C.sub,
          }}>All</button>
          <button onClick={() => setTypeFilter('income')} className="hs-btn" style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '6px 12px', borderRadius: 20,
            border: `1.4px solid ${typeFilter === 'income' ? C.tealDark : C.line}`,
            background: typeFilter === 'income' ? C.tealDark : 'transparent', color: typeFilter === 'income' ? '#fff' : C.sub,
          }}>Income</button>
          <button onClick={() => setTypeFilter('expense')} className="hs-btn" style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '6px 12px', borderRadius: 20,
            border: `1.4px solid ${typeFilter === 'expense' ? C.bad : C.line}`,
            background: typeFilter === 'expense' ? C.bad : 'transparent', color: typeFilter === 'expense' ? '#fff' : C.sub,
          }}>Expenses</button>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{
            fontFamily: "'JetBrains Mono',monospace", fontSize: 11, padding: '6px 10px', borderRadius: 20,
            border: `1.4px solid ${C.line}`, background: 'transparent', color: C.sub,
          }}>
            <option value="all">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={onManageCats} className="hs-btn" title="Manage categories" style={{
            width: 30, height: 30, borderRadius: '50%', border: `1.4px solid ${C.line}`, background: 'transparent', color: C.sub,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>⚙</button>
        </div>
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 16, padding: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <div style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 600, fontSize: 14 }}>Transactions</div>
          <div style={{ fontSize: 11, color: C.sub, fontFamily: "'JetBrains Mono',monospace" }}>({sorted.length})</div>
        </div>
        {sorted.length === 0 ? (
          <div style={{ fontSize: 12.5, color: C.sub, padding: '6px 2px' }}>No transactions yet — add one above to get started.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map(t => {
              const cat = finCatById(categories, t.category);
              const isIncome = t.type === 'income';
              return (
                <div key={t.id} className="hs-row" style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 46px 11px 12px',
                  borderRadius: 8, background: 'rgba(255,255,255,0.035)', borderLeft: `4px solid ${cat.color}`,
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isIncome ? C.good + '22' : C.bad + '22', color: isIncome ? C.good : C.bad,
                  }}>{isIncome ? <TrendingUp size={14} /> : <TrendingDown size={14} />}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, color: C.ink, marginBottom: 4, wordBreak: 'break-word' }}>{t.note || cat.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 10.5, fontFamily: "'JetBrains Mono',monospace", color: C.sub }}>
                      <span style={{ color: cat.color, textTransform: 'uppercase', letterSpacing: '0.03em', fontWeight: 700 }}>{cat.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        {(t.account || 'bank') === 'cash' ? <Banknote size={10} /> : <Landmark size={10} />}
                        {(t.account || 'bank') === 'cash' ? 'Cash' : 'Bank'}
                      </span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 14, color: isIncome ? C.good : C.bad, whiteSpace: 'nowrap' }}>
                    {isIncome ? '+' : '−'}{fmtMoney(Math.abs(t.amount))}
                  </div>
                  <button onClick={() => onEdit(t)} style={{ position: 'absolute', bottom: 10, right: 10, background: 'none', border: 'none', color: C.sub, cursor: 'pointer', display: 'flex' }}><Pencil size={12} /></button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
