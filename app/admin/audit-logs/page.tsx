'use client'
import { useEffect, useState } from 'react'

type Log = {
  id: string
  action: string
  entity_type: string
  entity_id: string
  actor_user_id: string
  created_at: string
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/audit-logs?limit=200')
      .then(r => r.json())
      .then(d => setLogs(d.logs || []))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <h1 className="font-nunito font-black text-white text-2xl mb-1">Audit Logs</h1>
      <p className="text-white/30 text-sm mb-6">Immutable trail of admin actions.</p>

      <div className="bg-gray-900 border border-white/5 rounded-xl overflow-hidden">
        {loading ? <div className="p-6 text-white/30 text-sm">Loading audit logs...</div> : (
          <table className="w-full text-sm">
            <thead><tr className="text-left border-b border-white/5"><th className="px-4 py-3 text-white/30">Time</th><th className="px-4 py-3 text-white/30">Action</th><th className="px-4 py-3 text-white/30">Entity</th><th className="px-4 py-3 text-white/30">Actor</th></tr></thead>
            <tbody>
              {logs.map(log => (
                <tr key={log.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white/40 text-xs">{new Date(log.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-white">{log.action}</td>
                  <td className="px-4 py-3 text-white/70 text-xs">{log.entity_type}:{log.entity_id}</td>
                  <td className="px-4 py-3 text-white/50 text-xs font-mono">{log.actor_user_id}</td>
                </tr>
              ))}
              {logs.length === 0 && <tr><td colSpan={4} className="px-4 py-5 text-white/30">No logs yet.</td></tr>}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
