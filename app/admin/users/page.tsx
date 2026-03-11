'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

interface UserCampaign {
  id:     string
  title:  string
  status: string
}

interface UserProfile {
  id:         string
  full_name:  string | null
  phone:      string | null
  is_admin:   boolean
  created_at: string | null
  campaigns:  UserCampaign[]
}

export default function AdminUsersPage() {
  const [users,    setUsers]    = useState<UserProfile[]>([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState('')
  const [updating, setUpdating] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('profiles')
      .select('*, campaigns(id, title, status)')
      .order('created_at', { ascending: false })
    setUsers((data ?? []) as UserProfile[])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function toggleAdmin(userId: string, current: boolean) {
    setUpdating(userId)
    const supabase = createClient()
    await supabase.from('profiles').update({ is_admin: !current }).eq('id', userId)
    await load()
    setUpdating(null)
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

      <div className="relative max-w-sm mb-6">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input type="text" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder-white/20 outline-none focus:border-primary transition-all" />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total users',    val: users.length                                         },
          { label: 'Admin users',    val: users.filter(u => u.is_admin).length                 },
          { label: 'With campaigns', val: users.filter(u => u.campaigns?.length > 0).length    },
        ].map((s, i) => (
          <div key={i} className="bg-gray-900 border border-white/5 rounded-xl px-5 py-4">
            <div className="font-nunito font-black text-white text-xl">{s.val}</div>
            <div className="text-white/30 text-xs">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-white/5 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-white/30 text-sm">Loading users...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-4xl mb-3">👤</div>
            <div className="text-white/30 text-sm">No users found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  {['User', 'Phone', 'Campaigns', 'Joined', 'Role', 'Admin access'].map(h => (
                    <th key={h} className="px-5 py-3.5 text-white/30 text-xs font-bold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-all">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-black text-primary text-xs">{u.full_name?.[0]?.toUpperCase() ?? '?'}</span>
                        </div>
                        <div>
                          <div className="text-white font-semibold">{u.full_name ?? 'Unnamed'}</div>
                          <div className="text-white/30 text-xs font-mono truncate max-w-[160px]">{u.id.substring(0, 12)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-white/60">{u.phone ?? '-'}</td>
                    <td className="px-5 py-4">
                      <div className="text-white/60">{u.campaigns?.length ?? 0} campaign{u.campaigns?.length !== 1 ? 's' : ''}</div>
                      {(u.campaigns?.length ?? 0) > 0 && (
                        <div className="text-white/30 text-xs truncate max-w-[140px]">{u.campaigns[0]?.title}</div>
                      )}
                    </td>
                    <td className="px-5 py-4 text-white/30 text-xs">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-4">
                      {u.is_admin
                        ? <span className="bg-primary/20 text-primary text-xs font-bold px-2.5 py-1 rounded-full">Admin</span>
                        : <span className="bg-white/5 text-white/40 text-xs font-bold px-2.5 py-1 rounded-full">User</span>}
                    </td>
                    <td className="px-5 py-4">
                      <button onClick={() => toggleAdmin(u.id, u.is_admin)} disabled={updating === u.id}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40 ${
                          u.is_admin
                            ? 'border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20'
                            : 'border-primary/20 bg-primary/10 text-primary hover:bg-primary/20'}`}>
                        {updating === u.id ? '...' : u.is_admin ? 'Revoke admin' : 'Grant admin'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
