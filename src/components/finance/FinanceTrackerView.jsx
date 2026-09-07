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
      <div className="hs-stat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 10, marginBottom: 18 }}>
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
      <div className="hs-card-hover" style={{
        background: 'rgba(21, 17, 32, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        padding: 18,
        marginBottom: 18,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15.5 }}>Income vs Expenses</div>
          <div style={{ display: 'flex', gap: 14, fontSize: 11, color: C.sub }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: '#10B981', display: 'inline-block', boxShadow: '0 0 6px rgba(16,185,129,0.5)' }} /> Income
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 9, height: 9, borderRadius: 3, background: '#EF4444', display: 'inline-block', boxShadow: '0 0 6px rgba(239,68,68,0.5)' }} /> Expenses
            </span>
          </div>
        </div>
        <div className="hs-finance-chart-bars" style={{ display: 'flex', alignItems: 'flex-end', gap: 16, height: 140 }}>
          {monthlyBars.map((b, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: '100%' }}>
                <div
                  title={`Income: ${fmtMoney(b.inc)}`}
                  className="hs-finance-chart-bar"
                  style={{
                    width: 18, height: `${Math.max(3, (b.inc / maxBar) * 100)}%`,
                    background: 'linear-gradient(180deg, #10B981, #059669)',
                    borderRadius: '6px 6px 0 0',
                    boxShadow: '0 0 10px rgba(16, 185, 129, 0.25)',
                    transition: 'height .3s ease',
                  }}
                />
                <div
                  title={`Expense: ${fmtMoney(b.exp)}`}
                  className="hs-finance-chart-bar"
                  style={{
                    width: 18, height: `${Math.max(3, (b.exp / maxBar) * 100)}%`,
                    background: 'linear-gradient(180deg, #EF4444, #DC2626)',
                    borderRadius: '6px 6px 0 0',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.25)',
                    transition: 'height .3s ease',
                  }}
                />
              </div>
              <div style={{ fontSize: 11, color: C.sub, fontWeight: 600, marginTop: 8 }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Expense breakdown by category */}
      {expenseBreakdown.length > 0 && (
        <div className="hs-card-hover" style={{
          background: 'rgba(21, 17, 32, 0.7)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: `1px solid ${C.line}`,
          borderRadius: 18,
          padding: 18,
          marginBottom: 18,
        }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15.5, marginBottom: 4 }}>Where It's Going</div>
          <div style={{ fontSize: 12, color: C.sub, marginBottom: 14 }}>Expense breakdown for this month</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
            {expenseBreakdown.map((e, i) => (
              <div key={i} className="hs-cat-breakdown-row" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div className="hs-cat-breakdown-name" style={{ width: 120, fontSize: 12.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: e.cat.color, fontWeight: 700 }}>{e.cat.name}</div>
                <div style={{ flex: 1, height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', minWidth: 60 }}>
                  <div style={{ width: `${e.pct}%`, height: '100%', background: e.cat.color, borderRadius: 999, boxShadow: `0 0 8px ${e.cat.color}66` }} />
                </div>
                <div style={{ width: 95, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.sub }}>{fmtMoney(e.amt)}</div>
                <div style={{ width: 42, textAlign: 'right', fontFamily: "'JetBrains Mono',monospace", fontSize: 12, color: C.ink, fontWeight: 700 }}>{e.pct}%</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
        <div className="hs-filter-ribbon" style={{ display: 'flex', flexWrap: 'wrap', gap: 7, alignItems: 'center' }}>
          <button onClick={() => setTypeFilter('all')} className="hs-btn" style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600, padding: '6px 14px', borderRadius: 999,
            border: `1.4px solid ${typeFilter === 'all' ? C.gold : C.line}`,
            background: typeFilter === 'all' ? 'linear-gradient(135deg, #F5C869, #D97706)' : 'rgba(255,255,255,0.03)',
            color: typeFilter === 'all' ? '#181003' : C.sub,
            boxShadow: typeFilter === 'all' ? '0 2px 10px rgba(245, 200, 105, 0.3)' : 'none',
          }}>All</button>
          <button onClick={() => setTypeFilter('income')} className="hs-btn" style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600, padding: '6px 14px', borderRadius: 999,
            border: `1.4px solid ${typeFilter === 'income' ? '#10B981' : C.line}`,
            background: typeFilter === 'income' ? 'linear-gradient(135deg, #10B981, #059669)' : 'rgba(255,255,255,0.03)',
            color: typeFilter === 'income' ? '#fff' : C.sub,
            boxShadow: typeFilter === 'income' ? '0 2px 10px rgba(16, 185, 129, 0.35)' : 'none',
          }}>Income</button>
          <button onClick={() => setTypeFilter('expense')} className="hs-btn" style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 11.5, fontWeight: 600, padding: '6px 14px', borderRadius: 999,
            border: `1.4px solid ${typeFilter === 'expense' ? '#EF4444' : C.line}`,
            background: typeFilter === 'expense' ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'rgba(255,255,255,0.03)',
            color: typeFilter === 'expense' ? '#fff' : C.sub,
            boxShadow: typeFilter === 'expense' ? '0 2px 10px rgba(239, 68, 68, 0.35)' : 'none',
          }}>Expenses</button>
          <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{
            fontFamily: "'Outfit', sans-serif", fontSize: 12, padding: '7px 12px', borderRadius: 999,
            border: `1.4px solid ${C.line}`, background: '#181324', color: C.sub, outline: 'none',
          }}>
            <option value="all">All categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={onManageCats} className="hs-btn" title="Manage categories" style={{
            width: 32, height: 32, borderRadius: '50%', border: `1.4px solid ${C.line}`,
            background: 'rgba(255,255,255,0.03)', color: C.sub,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>⚙</button>
        </div>
      </div>

      <div className="hs-card-hover" style={{
        background: 'rgba(21, 17, 32, 0.7)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: `1px solid ${C.line}`,
        borderRadius: 18,
        padding: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <div style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 700, fontSize: 15 }}>Transactions</div>
          <div style={{
            fontSize: 11, color: C.sub, fontFamily: "'JetBrains Mono',monospace",
            background: 'rgba(255,255,255,0.06)', padding: '1px 8px', borderRadius: 999,
          }}>({sorted.length})</div>
        </div>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 16px', color: C.sub, fontSize: 13.5 }}>
            No transactions yet — add one above to get started.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map(t => {
              const cat = finCatById(categories, t.category);
              const isIncome = t.type === 'income';
              return (
                <div key={t.id} className="hs-row" style={{
                  position: 'relative', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px',
                  borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                  borderLeft: `4px solid ${cat.color}`,
                }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isIncome ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                    border: `1px solid ${isIncome ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    color: isIncome ? '#10B981' : '#EF4444',
                  }}>{isIncome ? <TrendingUp size={16} /> : <TrendingDown size={16} />}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: C.ink, marginBottom: 4, wordBreak: 'break-word' }}>{t.note || cat.name}</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 11, fontFamily: "'JetBrains Mono',monospace", color: C.sub }}>
                      <span style={{ color: cat.color, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: 700 }}>{cat.name}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        {(t.account || 'bank') === 'cash' ? <Banknote size={11} /> : <Landmark size={11} />}
                        {(t.account || 'bank') === 'cash' ? 'Cash' : 'Bank'}
                      </span>
                      <span>{t.date}</span>
                    </div>
                  </div>
                  <div style={{
                    fontFamily: "'JetBrains Mono',monospace", fontWeight: 700, fontSize: 15,
                    color: isIncome ? '#10B981' : '#EF4444', whiteSpace: 'nowrap',
                    textShadow: isIncome ? '0 0 12px rgba(16, 185, 129, 0.3)' : '0 0 12px rgba(239, 68, 68, 0.3)',
                  }}>
                    {isIncome ? '+' : '−'}{fmtMoney(Math.abs(t.amount))}
                  </div>
                  <button onClick={() => onEdit(t)} className="hs-btn" style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 26, height: 26, borderRadius: 8, border: `1px solid ${C.line}`,
                    background: 'rgba(255,255,255,0.03)', color: C.sub, cursor: 'pointer', flexShrink: 0,
                  }}>
                    <Pencil size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
