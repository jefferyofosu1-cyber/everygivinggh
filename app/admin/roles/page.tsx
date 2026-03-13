'use client'
import { useEffect, useState } from 'react'

type RoleRow = {
  id: string
  user_id: string
  role: string
  permissions: string[]
}

export default function AdminRolesPage() {
  const [rows, setRows] = useState<RoleRow[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState('')
  const [role, setRole] = useState('moderator')

  async function load() {
    setLoading(true)
    const res = await fetch('/api/admin/roles')
    const data = await res.json()
    setRows(data.roles || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveRole() {
    if (!userId.trim()) return
    await fetch('/api/admin/roles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId.trim(), role, permissions: [] }),
    })
    setUserId('')
    load()
  }

  async function removeRole(rowUserId: string) {
    await fetch('/api/admin/roles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: rowUserId }),
    })
    load()
  }

  return (
    <div>
      <h1 className="font-nunito font-black text-white text-2xl mb-1">Roles</h1>
      <p className="text-white/30 text-sm mb-6">Assign role-based admin access for operations teams.</p>

      <div className="bg-gray-900 border border-white/5 rounded-xl p-4 mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="text-xs text-white/40 block mb-1">User ID</label>
          <input value={userId} onChange={e => setUserId(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white w-72" />
        </div>
        <div>
          <label className="text-xs text-white/40 block mb-1">Role</label>
          <select value={role} onChange={e => setRole(e.target.value)} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white">
            {['super_admin', 'moderator', 'finance', 'content_editor', 'support'].map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <button onClick={saveRole} className="px-4 py-2 bg-[#02A95C] rounded-lg text-sm font-bold text-white">Save role</button>
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? <div className="p-6 text-white/30 text-sm">Loading roles...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-white/5"><th className="px-4 py-3 text-white/30">User ID</th><th className="px-4 py-3 text-white/30">Role</th><th className="px-4 py-3 text-white/30">Updated</th><th className="px-4 py-3 text-white/30">Actions</th></tr></thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white/70 font-mono text-xs">{r.user_id}</td>
                  <td className="px-4 py-3 text-white">{r.role}</td>
                  <td className="px-4 py-3 text-white/40 text-xs">-</td>
                  <td className="px-4 py-3">
                    <button onClick={() => removeRole(r.user_id)} className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded">Delete</button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={4} className="px-4 py-5 text-white/30">No role assignments yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
