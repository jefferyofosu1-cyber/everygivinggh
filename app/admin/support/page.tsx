'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

type Ticket = {
  id: string
  type: string
  subject: string
  message: string
  priority: string
  status: string
  created_at: string
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [type, setType] = useState('general')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('normal')

  async function load() {
    const res = await fetch('/api/admin/support/tickets')
    const data = await res.json()
    setTickets(data.tickets || [])
  }

  useEffect(() => {
    load()
  }, [])

  const open = tickets.filter(t => t.status === 'open').length
  const urgent = tickets.filter(t => t.priority === 'high' || t.priority === 'urgent').length

  async function createTicket() {
    if (!subject.trim() || !message.trim()) return
    await fetch('/api/admin/support/tickets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, subject: subject.trim(), message: message.trim(), priority }),
    })
    setSubject('')
    setMessage('')
    load()
  }

  async function setTicketStatus(id: string, status: 'open' | 'closed') {
    await fetch(`/api/admin/support/tickets/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    load()
  }

  async function removeTicket(id: string) {
    await fetch(`/api/admin/support/tickets/${id}`, { method: 'DELETE' })
    load()
  }

  return (
    <div>
      <h1 className="font-nunito font-black text-white text-2xl mb-1">Support Inbox</h1>
      <p className="text-white/30 text-sm mb-6">Manage support tickets and donor/fundraiser issues.</p>

      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-white/5 rounded-xl p-4"><p className="text-xs text-white/30">Total Tickets</p><p className="text-xl text-white font-black">{tickets.length}</p></div>
        <div className="bg-gray-900 border border-white/5 rounded-xl p-4"><p className="text-xs text-white/30">Open</p><p className="text-xl text-amber-300 font-black">{open}</p></div>
        <div className="bg-gray-900 border border-white/5 rounded-xl p-4"><p className="text-xs text-white/30">Urgent</p><p className="text-xl text-red-400 font-black">{urgent}</p></div>
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-xl p-4 mb-6 grid md:grid-cols-5 gap-3">
        <select value={type} onChange={e => setType(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="general">general</option>
          <option value="donation">donation</option>
          <option value="campaign">campaign</option>
          <option value="account">account</option>
        </select>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Ticket subject" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <input value={message} onChange={e => setMessage(e.target.value)} placeholder="Ticket message" className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white" />
        <select value={priority} onChange={e => setPriority(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
          <option value="low">low</option>
          <option value="normal">normal</option>
          <option value="high">high</option>
          <option value="urgent">urgent</option>
        </select>
        <button onClick={createTicket} className="px-4 py-2 bg-[#02A95C] rounded-lg text-white text-sm font-bold">Create Ticket</button>
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-semibold">Recent Tickets</h2>
          <Link href="/admin/disputes" className="text-xs text-[#02A95C]">View disputes</Link>
        </div>
        <div className="space-y-2">
          {tickets.slice(0, 20).map(t => (
            <div key={t.id} className="p-3 rounded-lg bg-white/5">
              <p className="text-white text-sm">{t.subject}</p>
              <p className="text-white/40 text-xs">{t.type} · {t.priority} · {t.status} · {new Date(t.created_at).toLocaleString()}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => setTicketStatus(t.id, 'open')} className="px-2 py-1 text-xs bg-amber-500/20 text-amber-300 rounded">Open</button>
                <button onClick={() => setTicketStatus(t.id, 'closed')} className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded">Close</button>
                <button onClick={() => removeTicket(t.id)} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">Delete</button>
              </div>
            </div>
          ))}
          {tickets.length === 0 && <p className="text-white/30 text-sm">No tickets yet.</p>}
        </div>
      </div>
    </div>
  )
}
