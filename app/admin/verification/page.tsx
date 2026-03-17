'use client';
import { useState } from 'react';
import Link from 'next/link';

type VerifyItem = {
  id: string; name: string; phone: string; campaign: string; category: string;
  submitted: string; status: string; rejectReason?: string; front: string; back: string;
};

const MOCK_QUEUE: VerifyItem[] = [
  { id:'v1', name:'Kwame Mensah', phone:'024 123 4567', campaign:'Help Ama get kidney surgery', category:'Medical', submitted:'2 hrs ago', status:'pending', front:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=70', back:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=70' },
  { id:'v2', name:'Ama Boateng', phone:'020 987 6543', campaign:'School supplies for Volta children', category:'Education', submitted:'5 hrs ago', status:'pending', front:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=70', back:'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=300&q=70' },
  { id:'v3', name:'Pastor Isaac Asare', phone:'027 555 4444', campaign:'New roof for Bethel Assembly', category:'Faith', submitted:'1 day ago', status:'pending', front:'https://images.unsplash.com/photo-1519491050282-cf00c82424c4?w=300&q=70', back:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&q=70' },
  { id:'v4', name:'Efua Owusu', phone:'026 111 2222', campaign:'Community borehole project', category:'Community', submitted:'2 days ago', status:'approved', front:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=70', back:'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&q=70' },
];

const statusStyle = (s: string) => ({
  color: s==='approved'?'#0A6B4B':s==='rejected'?'#C0392B':'#B85C00',
  background: s==='approved'?'#E8F5EF':s==='rejected'?'#FCEBEB':'#FEF3E2',
  fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,flexShrink:0,
});

export default function AdminVerificationPage() {
  const [queue, setQueue] = useState<VerifyItem[]>(MOCK_QUEUE);
  const [selected, setSelected] = useState<string|null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [filter, setFilter] = useState('pending');

  const filtered = queue.filter(q => filter==='all' || q.status===filter);
  const item = queue.find(q => q.id===selected) || null;

  function approve(id: string) {
    // TODO: PATCH /api/admin/verification/:id/approve
    setQueue(prev => prev.map(q => q.id===id ? {...q,status:'approved'} : q));
    setSelected(null);
  }
  function reject(id: string) {
    if (!rejectReason.trim()) return;
    // TODO: PATCH /api/admin/verification/:id/reject { reason }
    setQueue(prev => prev.map(q => q.id===id ? {...q,status:'rejected',rejectReason} : q));
    setSelected(null); setRejectReason(''); setShowReject(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        button,input,textarea{font-family:'DM Sans',sans-serif}
        textarea:focus,input:focus{outline:none;border-color:#0A6B4B!important}
      `}</style>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#fff',borderBottom:'1px solid #E8E4DC',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link href="/" style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18'}}>Every<span style={{color:'#0A6B4B'}}>Giving</span></Link>
          <div style={{width:1,height:16,background:'#E8E4DC'}}/>
          <span style={{fontSize:12,color:'#8A8A82'}}>Admin · Verification queue</span>
        </div>
        <div style={{display:'flex',gap:12}}>
          <Link href="/admin/payouts" style={{fontSize:12,color:'#8A8A82'}}>Payouts</Link>
          <Link href="/admin" style={{fontSize:12,color:'#8A8A82'}}>Dashboard</Link>
        </div>
      </nav>

      <div style={{maxWidth:1060,margin:'0 auto',padding:'24px 24px 64px',display:'grid',gridTemplateColumns:'340px 1fr',gap:20,alignItems:'start'}}>
        {/* Left — list */}
        <div>
          <div style={{marginBottom:14}}>
            <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#1A1A18',marginBottom:10}}>Verification queue</h2>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {['pending','approved','rejected','all'].map(f=>(
                <button key={f} style={{fontSize:11,fontWeight:500,padding:'4px 10px',borderRadius:20,cursor:'pointer',transition:'all .15s',background:filter===f?'#1A1A18':'transparent',color:filter===f?'#fff':'#8A8A82',border:`1px solid ${filter===f?'#1A1A18':'#E8E4DC'}`}} onClick={()=>setFilter(f)}>
                  {f} {f!=='all'&&<span style={{fontSize:10,marginLeft:3}}>{queue.filter(q=>q.status===f).length}</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {filtered.map(q=>(
              <div key={q.id}
                style={{display:'flex',alignItems:'center',gap:10,background:selected===q.id?'#E8F5EF':'#fff',border:`1.5px solid ${selected===q.id?'#0A6B4B':'#E8E4DC'}`,borderRadius:11,padding:'11px 12px',cursor:'pointer',transition:'all .15s'}}
                onClick={()=>setSelected(q.id)}
              >
                <div style={{width:34,height:34,borderRadius:'50%',background:'#E8F5EF',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#0A6B4B',flexShrink:0}}>{q.name[0]}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#1A1A18'}}>{q.name}</div>
                  <div style={{fontSize:11,color:'#8A8A82',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{q.campaign.slice(0,45)}{q.campaign.length>45?'…':''}</div>
                  <div style={{fontSize:10,color:'#C8C4BC'}}>{q.phone} · {q.submitted}</div>
                </div>
                <div style={statusStyle(q.status) as any}>{q.status}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — review */}
        <div style={{position:'sticky',top:72}}>
          {item ? (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:14,paddingBottom:14,borderBottom:'1px solid #E8E4DC'}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:'#1A1A18',marginBottom:3}}>{item.name}</div>
                  <div style={{fontSize:11,color:'#8A8A82',lineHeight:1.5}}>{item.phone} · {item.category} campaign · Submitted {item.submitted}</div>
                </div>
                <div style={statusStyle(item.status) as any}>{item.status}</div>
              </div>

              <div style={{background:'#F5F4F0',borderRadius:8,padding:'10px 12px',marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:4}}>Campaign</div>
                <div style={{fontSize:13,fontWeight:600,color:'#1A1A18'}}>{item.campaign}</div>
              </div>

              <div style={{marginBottom:16}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8}}>ID document</div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
                  <div><div style={{fontSize:10,color:'#8A8A82',marginBottom:4}}>Front</div><img src={item.front} style={{width:'100%',height:110,objectFit:'cover',borderRadius:7}} alt="Front"/></div>
                  <div><div style={{fontSize:10,color:'#8A8A82',marginBottom:4}}>Back</div><img src={item.back} style={{width:'100%',height:110,objectFit:'cover',borderRadius:7}} alt="Back"/></div>
                </div>
              </div>

              {item.status==='pending' && !showReject && (
                <div style={{display:'flex',gap:8}}>
                  <button style={{flex:2,padding:11,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer'}} onClick={()=>approve(item.id)}>Approve ✓</button>
                  <button style={{flex:1,padding:11,background:'transparent',color:'#C0392B',border:'1px solid #C0392B',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer'}} onClick={()=>setShowReject(true)}>Reject</button>
                </div>
              )}
              {showReject && (
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'#4A4A44',display:'block',marginBottom:6}}>Reason for rejection (sent to campaigner)</label>
                  <textarea style={{width:'100%',padding:'10px 12px',border:'1.5px solid #C0392B',borderRadius:8,fontSize:13,minHeight:80,resize:'vertical',marginBottom:8}} placeholder="e.g. Photo is too blurry — please retake with better lighting" value={rejectReason} onChange={e=>setRejectReason(e.target.value)}/>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{flex:1,padding:10,background:'#C0392B',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',opacity:rejectReason.trim()?1:.45}} disabled={!rejectReason.trim()} onClick={()=>reject(item.id)}>Send rejection</button>
                    <button style={{padding:'10px 14px',background:'transparent',border:'1px solid #E8E4DC',borderRadius:8,fontSize:12,cursor:'pointer'}} onClick={()=>setShowReject(false)}>Cancel</button>
                  </div>
                </div>
              )}
              {item.status==='approved' && <div style={{fontSize:13,color:'#0A6B4B',background:'#E8F5EF',padding:'10px 12px',borderRadius:8,textAlign:'center'}}>✓ Approved — campaign is live</div>}
              {item.status==='rejected' && <div style={{fontSize:13,color:'#C0392B',background:'#FCEBEB',padding:'10px 12px',borderRadius:8}}>Rejected: {item.rejectReason}</div>}
            </div>
          ) : (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:40,textAlign:'center',color:'#8A8A82',fontSize:13}}>Select a submission to review</div>
          )}
        </div>
      </div>
    </>
  );
}
