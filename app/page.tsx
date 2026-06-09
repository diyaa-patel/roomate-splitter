'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['Rent', 'Utilities', 'Groceries', 'Other']

export default function Home() {
  const [expenses, setExpenses] = useState<any[]>([])
  const [roommates, setRoomates] = useState(['', '', ''])
  const [roommateCount, setRoommateCount] = useState(3)
  const [customCategory, setCustomCategory] = useState('')
  const [form, setForm] = useState({ description: '', amount: '', category: 'Rent', paidBy: '' })
  const [loading, setLoading] = useState(false)
  const [setupDone, setSetupDone] = useState(false)

  useEffect(() => { fetchExpenses() }, [])

  async function fetchExpenses() {
    const { data } = await supabase.from('expenses').select('*').order('created_at', { ascending: false })
    if (data) setExpenses(data)
  }

  async function addExpense() {
    if (!form.description || !form.amount || !form.paidBy) return
    const category = form.category === 'Other' ? customCategory || 'Other' : form.category
    setLoading(true)
    await supabase.from('expenses').insert({
      description: form.description,
      amount: parseFloat(form.amount),
      category,
      paid_by: form.paidBy,
    })
    setForm({ description: '', amount: '', category: 'Rent', paidBy: '' })
    setCustomCategory('')
    await fetchExpenses()
    setLoading(false)
  }

  function getBalance(name: string) {
    const active = activeRoomates
    if (active.length === 0) return 0
    let balance = 0
    expenses.forEach((e) => {
      if (!active.includes(e.paid_by)) return
      const split = e.amount / active.length
      if (e.paid_by === name) balance += e.amount - split
      else balance -= split
    })
    return balance
  }

  const activeRoomates = roommates.slice(0, roommateCount).filter(r => r.trim() !== '')

  const glassCard: React.CSSProperties = {
    background: 'rgba(255,255,255,0.25)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderRadius: '28px',
    border: '1.5px solid rgba(255,255,255,0.85)',
    boxShadow: '0 2px 0px rgba(255,255,255,0.9) inset, 0 -1px 0px rgba(0,0,0,0.08) inset, 0 8px 32px rgba(100,80,180,0.13)',
    padding: '28px',
  }

  const glassInput: React.CSSProperties = {
    background: 'rgba(255,255,255,0.35)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.8)',
    borderRadius: '14px',
    padding: '10px 16px',
    fontSize: '14px',
    outline: 'none',
    width: '100%',
    color: '#3d2a6e',
    boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset',
  }

  const glassBtn: React.CSSProperties = {
    background: 'rgba(255,255,255,0.45)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1.5px solid rgba(255,255,255,0.9)',
    borderRadius: '50px',
    padding: '12px',
    fontSize: '15px',
    fontWeight: '600',
    color: '#3a1a6a',
    cursor: 'pointer',
    width: '100%',
    boxShadow: '0 2px 0 rgba(255,255,255,0.95) inset, 0 4px 16px rgba(100,80,180,0.15)',
    transition: 'all 0.2s',
  }

  const bg = 'linear-gradient(145deg, #c8b8f0 0%, #b8c8f8 40%, #d8b8f0 70%, #c0d0ff 100%)'

  if (!setupDone) {
    return (
      <main style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={glassCard}>
            <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#3d2a6e', marginBottom: '4px' }}>Roommate Splitter</h1>
            <p style={{ color: '#7a6a9a', fontSize: '13px', marginBottom: '28px' }}>Set up your house first</p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: '#5a4a7a', fontSize: '12px', display: 'block', marginBottom: '8px', fontWeight: '500' }}>How many roommates?</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRoommateCount(n)} style={{
                    ...glassBtn,
                    flex: 1,
                    padding: '8px',
                    fontSize: '14px',
                    background: roommateCount === n ? 'rgba(100,70,200,0.3)' : 'rgba(255,255,255,0.3)',
                    color: roommateCount === n ? '#3d2a6e' : '#7a6a9a',
                    fontWeight: roommateCount === n ? '700' : '500',
                  }}>{n}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {Array.from({ length: roommateCount }).map((_, i) => (
                <input key={i} style={glassInput} placeholder={`Roommate ${i + 1} name`}
                  value={roommates[i] || ''}
                  onChange={(e) => { const u = [...roommates]; u[i] = e.target.value; setRoomates(u) }}
                />
              ))}
            </div>

            <button onClick={() => setSetupDone(true)} disabled={activeRoomates.length < 2} style={{ ...glassBtn, opacity: activeRoomates.length < 2 ? 0.4 : 1 }}>
              Let's go →
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100vh', background: bg, padding: '2rem' }}>
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>

        <div style={{ marginBottom: '28px' }}>
          <h1 style={{ fontSize: '30px', fontWeight: '700', color: '#3d2a6e', marginBottom: '4px' }}>Roommate Splitter</h1>
          <p style={{ color: '#9a8aba', fontSize: '13px' }}>{activeRoomates.join(' · ')}</p>
        </div>

        {/* Balances */}
        <div style={{ ...glassCard, marginBottom: '16px' }}>
          <h2 style={{ fontWeight: '600', color: '#3d2a6e', marginBottom: '16px', fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Balances</h2>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${activeRoomates.length}, 1fr)`, gap: '10px' }}>
            {activeRoomates.map((name) => {
              const bal = getBalance(name)
              return (
                <div key={name} style={{ textAlign: 'center', padding: '16px 8px', background: 'rgba(255,255,255,0.3)', borderRadius: '18px', border: '1px solid rgba(255,255,255,0.8)', boxShadow: '0 1px 0 rgba(255,255,255,0.95) inset' }}>
                  <p style={{ fontSize: '11px', color: '#9a8aba', marginBottom: '6px', fontWeight: '500' }}>{name}</p>
                  <p style={{ fontSize: '18px', fontWeight: '700', color: bal >= 0 ? '#16a34a' : '#dc2626' }}>
                    {bal >= 0 ? '+' : ''}${bal.toFixed(2)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Add Expense */}
        <div style={{ ...glassCard, marginBottom: '16px' }}>
          <h2 style={{ fontWeight: '600', color: '#3d2a6e', marginBottom: '16px', fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Add Expense</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input style={glassInput} placeholder="Description (e.g. October rent)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <input style={glassInput} placeholder="Amount ($)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <select style={glassInput} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            {form.category === 'Other' && (
              <input style={glassInput} placeholder="What is it? (e.g. Netflix, Parking)" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} />
            )}
            <select style={glassInput} value={form.paidBy} onChange={(e) => setForm({ ...form, paidBy: e.target.value })}>
              <option value="" disabled>Who paid?</option>
              {activeRoomates.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <button onClick={addExpense} disabled={loading || !form.paidBy} style={{ ...glassBtn, opacity: loading || !form.paidBy ? 0.4 : 1 }}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </div>

        {/* Expenses */}
        <div style={glassCard}>
          <h2 style={{ fontWeight: '600', color: '#3d2a6e', marginBottom: '16px', fontSize: '14px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Expenses</h2>
          {expenses.length === 0 ? (
            <p style={{ color: '#bbb', fontSize: '14px' }}>No expenses yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {expenses.map((e) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.3)', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.8)' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', color: '#3d2a6e' }}>{e.description}</p>
                    <p style={{ fontSize: '12px', color: '#9a8aba', marginTop: '2px' }}>{e.category} · paid by {e.paid_by}</p>
                  </div>
                  <p style={{ fontSize: '15px', fontWeight: '700', color: '#3d2a6e' }}>${parseFloat(e.amount).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <button onClick={() => setSetupDone(false)} style={{ marginTop: '16px', color: '#9a8aba', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← change roommates
        </button>

      </div>
    </main>
  )
}