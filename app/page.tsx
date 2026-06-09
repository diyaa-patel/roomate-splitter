'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const CATEGORIES = ['Rent', 'Utilities', 'Groceries', 'Other']
const ROOMMATES = ['Diya', 'Roommate 2', 'Roommate 3']

export default function Home() {
  const [expenses, setExpenses] = useState([])
  const [form, setForm] = useState({
    description: '',
    amount: '',
    category: 'Rent',
    paidBy: 'Diya',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchExpenses()
  }, [])

  async function fetchExpenses() {
    const { data } = await supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setExpenses(data)
  }

  async function addExpense() {
    if (!form.description || !form.amount) return
    setLoading(true)
    await supabase.from('expenses').insert({
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category,
      paid_by: form.paidBy,
    })
    setForm({ description: '', amount: '', category: 'Rent', paidBy: 'Diya' })
    await fetchExpenses()
    setLoading(false)
  }

  function getBalance(name) {
    let balance = 0
    expenses.forEach((e) => {
      const split = e.amount / ROOMMATES.length
      if (e.paid_by === name) balance += e.amount - split
      else balance -= split
    })
    return balance.toFixed(2)
  }

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Roommate Splitter</h1>
        <p className="text-gray-500 mb-8">Split rent, utilities, and groceries with your roommates.</p>

        {/* Balances */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Balances</h2>
          <div className="grid grid-cols-3 gap-4">
            {ROOMMATES.map((name) => {
              const bal = getBalance(name)
              return (
                <div key={name} className="text-center p-4 bg-gray-50 rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">{name}</p>
                  <p className={`text-xl font-bold ${bal >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    ${bal}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Add Expense */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Expense</h2>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <input
              className="border border-gray-200 rounded-lg p-2 text-sm col-span-2"
              placeholder="Description (e.g. October rent)"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <input
              className="border border-gray-200 rounded-lg p-2 text-sm"
              placeholder="Amount ($)"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <select
              className="border border-gray-200 rounded-lg p-2 text-sm"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select
              className="border border-gray-200 rounded-lg p-2 text-sm"
              value={form.paidBy}
              onChange={(e) => setForm({ ...form, paidBy: e.target.value })}
            >
              {ROOMMATES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button
            onClick={addExpense}
            disabled={loading}
            className="w-full bg-gray-900 text-white rounded-lg p-2 text-sm font-medium hover:bg-gray-700 transition disabled:opacity-50"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </div>

        {/* Expense List */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Expenses</h2>
          {expenses.length === 0 ? (
            <p className="text-gray-400 text-sm">No expenses yet.</p>
          ) : (
            <div className="space-y-3">
              {expenses.map((e) => (
                <div key={e.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{e.description}</p>
                    <p className="text-xs text-gray-400">{e.category} · paid by {e.paid_by}</p>
                  </div>
                  <p className="text-sm font-bold text-gray-900">${parseFloat(e.amount).toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}