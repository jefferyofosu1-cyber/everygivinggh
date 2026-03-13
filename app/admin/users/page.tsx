'use client'
import { useEffect, useState } from 'react'

function UserModal({ user, onClose, onUpdate }: { user: any; onClose: () => void; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false)
  const [fields, setFields] = useState({
    full_name: user.full_name || '',
    phone: user.phone || '',
    email: user.email || '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [toggling, setToggling] = useState(false)

  const inputCls = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all'

  const saveEdits = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, ...fields }),
      })
      if (res.ok) { setEditing(false); onUpdate() }
    } catch (e) { console.error('saveEdits error:', e) }
    setSaving(false)
  }

  const toggleAdmin = async () => {
    setToggling(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, is_admin: !user.is_admin }),
      })
      if (res.ok) onUpdate()
    } catch (e) { console.error('toggleAdmin error:', e) }
    setToggling(false)
  }

  const deleteUser = async () => {
    setDeleting(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id }),
      })
      if (res.ok) { onUpdate(); onClose() }
    } catch (e) { console.error('deleteUser error:', e) }
    setDeleting(false)
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="font-nunito font-black text-white text-lg mb-1">{editing ? 'Edit User' : (user.full_name || 'Unnamed')}</h2>
            <div className="flex items-center gap-2">
              {user.is_admin ? (
                <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-full">Admin</span>
              ) : (
                <span className="bg-white/5 text-white/40 text-xs font-bold px-2.5 py-1 rounded-full">User</span>
              )}
              <span className="text-white/30 text-xs font-mono">{user.id?.substring(0, 12)}…</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-4">
            {!editing && <button onClick={() => setEditing(true)} className="text-xs text-primary hover:text-primary/80 font-bold transition-colors">Edit</button>}
            <button onClick={onClose} className="text-white/30 hover:text-white text-2xl leading-none">×</button>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-4">
          {editing ? (
            <>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Full Name</label>
                <input value={fields.full_name} onChange={e => setFields(f => ({ ...f, full_name: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Phone</label>
                <input value={fields.phone} onChange={e => setFields(f => ({ ...f, phone: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="text-white/40 text-xs font-bold uppercase tracking-wider block mb-1.5">Email</label>
                <input type="email" value={fields.email} onChange={e => setFields(f => ({ ...f, email: e.target.value }))} className={inputCls} />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setEditing(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-bold rounded-xl transition-all text-sm">Cancel</button>
                <button onClick={saveEdits} disabled={saving} className="flex-[2] py-3 bg-primary hover:bg-primary-dark text-white font-nunito font-black rounded-xl transition-all text-sm disabled:opacity-50 shadow-lg shadow-primary/20">
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-white/30 text-xs mb-0.5">Name</div><div className="text-white font-semibold">{user.full_name || ' - '}</div></div>
                  <div><div className="text-white/30 text-xs mb-0.5">Phone</div><div className="text-white font-semibold">{user.phone || ' - '}</div></div>
                  <div><div className="text-white/30 text-xs mb-0.5">Email</div><div className="text-white font-semibold">{user.email || ' - '}</div></div>
                  <div><div className="text-white/30 text-xs mb-0.5">Joined</div><div className="text-white font-semibold">{user.created_at ? new Date(user.created_at).toLocaleDateString() : ' - '}</div></div>
                  <div className="col-span-2"><div className="text-white/30 text-xs mb-0.5">Campaigns</div><div className="text-white font-semibold">{user.campaigns?.length || 0} campaign{user.campaigns?.length !== 1 ? 's' : ''}</div></div>
                </div>
              </div>

              {/* Admin toggle */}
              <button onClick={toggleAdmin} disabled={toggling}
                className={`w-full py-3 text-sm font-bold rounded-xl border transition-all disabled:opacity-40 ${
                  user.is_admin
                    ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                    : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/20'
                }`}>
                {toggling ? '…' : user.is_admin ? 'Revoke Admin Access' : 'Grant Admin Access'}
              </button>

              {/* Delete */}
              {confirmDelete ? (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <p className="text-red-400 text-xs mb-3">This will permanently delete this user, their campaigns, and all related donations. This cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setConfirmDelete(false)} className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-xs font-bold rounded-lg transition-all">Cancel</button>
                    <button onClick={deleteUser} disabled={deleting} className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-lg transition-all disabled:opacity-50">
                      {deleting ? 'Deleting…' : 'Yes, delete permanently'}
                    </button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setConfirmDelete(true)} className="w-full text-center text-xs text-red-400/60 hover:text-red-400 transition-colors py-2">
                  Delete user
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<any>(null)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggleAdmin = async (userId: string, current: boolean) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: userId, is_admin: !current }),
    })
    await load()
  }

  const filtered = users.filter(u =>
    !search ||
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-nunito font-black text-white text-2xl mb-1">Users</h1>
        <p className="text-white/30 text-sm">All registered accounts. Grant or revoke admin access here.</p>
      </div>

      {/* Search */}
      <div className="relative max-w-sm mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Search by name or phone…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all" />
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total users', val: users.length },
          { label: 'Admin users', val: users.filter(u => u.is_admin).length },
          { label: 'With campaigns', val: users.filter(u => u.campaigns?.length > 0).length },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900 border border-white/5 rounded-xl px-5 py-4">
            <div className="font-nunito font-black text-white text-xl">{s.val}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">Loading users…</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3"></div>
            <div className="text-white/30 text-sm">No users found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">User</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Phone</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Campaigns</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Joined</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Admin access</th>
                  <th className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-white/3 transition-all">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-black text-primary text-xs">{u.full_name?.[0]?.toUpperCase() || '?'}</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">{u.full_name || 'Unnamed'}</div>
                          <div className="text-white/30 text-xs font-mono truncate max-w-[160px]">{u.id?.substring(0, 12)}…</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/60">{u.phone || ' - '}</td>
                    <td className="px-5 py-4">
                      <div className="text-white/60">{u.campaigns?.length || 0} campaign{u.campaigns?.length !== 1 ? 's' : ''}</div>
                      {u.campaigns?.length > 0 && (
                        <div className="text-white/30 text-xs truncate max-w-[140px]">{u.campaigns[0]?.title}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-white/30 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString() : ' - '}</td>
                    <td className="px-5 py-4">
                      {u.is_admin ? (
                        <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-full">Admin</span>
                      ) : (
                        <span className="bg-white/5 text-white/40 text-xs font-bold px-2.5 py-1 rounded-full">User</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleAdmin(u.id, u.is_admin)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                          u.is_admin
                            ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/20'
                        }`}>
                        {u.is_admin ? 'Revoke admin' : 'Grant admin'}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => setSelected(u)}
                        className="bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 hover:border-primary/30 text-white/60 text-xs font-bold px-3 py-1.5 rounded-lg transition-all">
                        View →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && <UserModal user={selected} onClose={() => setSelected(null)} onUpdate={() => { setSelected(null); load() }} />}
    </div>
  )
}
