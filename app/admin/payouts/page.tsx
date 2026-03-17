'use client';
import { useState } from 'react';
import Link from 'next/link';

type ProofItem = {
  id: string; campaign: string; organiser: string; milestone: string; amount: number;
  network: string; momoNumber: string; submitted: string; status: string;
  proof: string; note: string; rejectNote?: string;
};

const MOCK_PROOFS: ProofItem[] = [
  { id:'p1', campaign:'Help Ama get kidney surgery', organiser:'Kwame Mensah', milestone:'Surgery fees', amount:12000, network:'MTN MoMo', momoNumber:'024 123 4567', submitted:'1 hr ago', status:'pending', proof:'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=300&q=70', note:'This covers the surgical fees at Korle Bu. Receipt attached.' },
  { id:'p2', campaign:'School supplies Volta Region', organiser:'Ama Boateng', milestone:'Buy supplies', amount:4500, network:'Vodafone Cash', momoNumber:'020 987 6543', submitted:'3 hrs ago', status:'pending', proof:'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=300&q=70', note:'Supplies purchased from Accra Central market. Receipts attached.' },
  { id:'p3', campaign:'Community borehole project', organiser:'Efua Owusu', milestone:'Drilling deposit', amount:8000, network:'AirtelTigo', momoNumber:'026 111 2222', submitted:'2 days ago', status:'approved', proof:'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=300&q=70', note:'Deposit paid to DrillersCo Ghana.' },
];

const statusStyle = (s: string) => ({
  color: s==='approved'?'#0A6B4B':s==='rejected'?'#C0392B':'#B85C00',
  background: s==='approved'?'#E8F5EF':s==='rejected'?'#FCEBEB':'#FEF3E2',
  fontSize:10,fontWeight:700,padding:'2px 7px',borderRadius:20,flexShrink:0,
});

export default function AdminPayoutsPage() {
  const [proofs, setProofs] = useState<ProofItem[]>(MOCK_PROOFS);
  const [selected, setSelected] = useState<string|null>(null);
  const [filter, setFilter] = useState('pending');
  const [rejectNote, setRejectNote] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [paying, setPaying] = useState(false);

  const filtered = proofs.filter(p => filter==='all'||p.status===filter);
  const item = proofs.find(p => p.id===selected) || null;

  async function approvePayout(id: string) {
    setPaying(true);
    // TODO: POST /api/admin/payouts/:id/approve
    await new Promise(r => setTimeout(r, 1000));
    setPaying(false);
    setProofs(prev => prev.map(p => p.id===id ? {...p,status:'approved'} : p));
    setSelected(null);
  }
  function rejectProof(id: string) {
    // TODO: POST /api/admin/payouts/:id/reject { reason }
    setProofs(prev => prev.map(p => p.id===id ? {...p,status:'rejected',rejectNote} : p));
    setSelected(null); setRejectNote(''); setShowReject(false);
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        button,input,textarea{font-family:'DM Sans',sans-serif}
        textarea:focus{outline:none;border-color:#0A6B4B!important}
      `}</style>
      <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 24px',height:56,background:'#fff',borderBottom:'1px solid #E8E4DC',position:'sticky',top:0,zIndex:100}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <Link href="/" style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18'}}>Every<span style={{color:'#0A6B4B'}}>Giving</span></Link>
          <div style={{width:1,height:16,background:'#E8E4DC'}}/>
          <span style={{fontSize:12,color:'#8A8A82'}}>Admin · Milestone payouts</span>
        </div>
        <div style={{display:'flex',gap:12}}>
          <Link href="/admin/verification" style={{fontSize:12,color:'#8A8A82'}}>Verifications</Link>
          <Link href="/admin" style={{fontSize:12,color:'#8A8A82'}}>Dashboard</Link>
        </div>
      </nav>

      <div style={{maxWidth:1060,margin:'0 auto',padding:'24px 24px 64px',display:'grid',gridTemplateColumns:'340px 1fr',gap:20,alignItems:'start'}}>
        <div>
          <div style={{marginBottom:14}}>
            <h2 style={{fontFamily:"'DM Serif Display',serif",fontSize:20,color:'#1A1A18',marginBottom:10}}>Milestone payouts</h2>
            <div style={{display:'flex',gap:5,flexWrap:'wrap'}}>
              {['pending','approved','rejected','all'].map(f=>(
                <button key={f} style={{fontSize:11,fontWeight:500,padding:'4px 10px',borderRadius:20,cursor:'pointer',transition:'all .15s',background:filter===f?'#1A1A18':'transparent',color:filter===f?'#fff':'#8A8A82',border:`1px solid ${filter===f?'#1A1A18':'#E8E4DC'}`}} onClick={()=>setFilter(f)}>
                  {f} {f!=='all'&&<span style={{fontSize:10,marginLeft:3}}>{proofs.filter(p=>p.status===f).length}</span>}
                </button>
              ))}
            </div>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:7}}>
            {filtered.map(p=>(
              <div key={p.id}
                style={{display:'flex',alignItems:'center',gap:10,background:selected===p.id?'#E8F5EF':'#fff',border:`1.5px solid ${selected===p.id?'#0A6B4B':'#E8E4DC'}`,borderRadius:11,padding:'11px 12px',cursor:'pointer',transition:'all .15s'}}
                onClick={()=>{setSelected(p.id);setShowReject(false);}}
              >
                <div style={{width:34,height:34,borderRadius:'50%',background:'#E6F1FB',display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,fontWeight:700,color:'#185FA5',flexShrink:0}}>₵</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#1A1A18'}}>{p.milestone} — ₵{p.amount.toLocaleString()}</div>
                  <div style={{fontSize:11,color:'#8A8A82',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.campaign.slice(0,40)}{p.campaign.length>40?'…':''}</div>
                  <div style={{fontSize:10,color:'#C8C4BC'}}>{p.organiser} · {p.submitted}</div>
                </div>
                <div style={statusStyle(p.status) as any}>{p.status}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{position:'sticky',top:72}}>
          {item ? (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:'18px 16px'}}>
              <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',gap:10,marginBottom:14,paddingBottom:14,borderBottom:'1px solid #E8E4DC'}}>
                <div>
                  <div style={{fontSize:16,fontWeight:700,color:'#1A1A18',marginBottom:3}}>₵{item.amount.toLocaleString()} · {item.milestone}</div>
                  <div style={{fontSize:11,color:'#8A8A82',lineHeight:1.5}}>{item.campaign} · {item.organiser}</div>
                </div>
                <div style={statusStyle(item.status) as any}>{item.status}</div>
              </div>

              <div style={{background:'#F5F4F0',borderRadius:9,padding:12,marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8}}>Payout destination</div>
                {[['Network',item.network],['MoMo number',item.momoNumber],['Amount',`₵${item.amount.toLocaleString()}`]].map(([l,v],i)=>(
                  <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:5}}>
                    <span style={{color:'#8A8A82'}}>{l}</span>
                    <span style={{fontWeight:600,color:'#1A1A18'}}>{v}</span>
                  </div>
                ))}
              </div>

              <div style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:600,color:'#8A8A82',marginBottom:8}}>Submitted proof</div>
                <img src={item.proof} style={{width:'100%',height:140,objectFit:'cover',borderRadius:8,display:'block',marginBottom:8}} alt="Proof"/>
                <div style={{fontSize:12,color:'#4A4A44',lineHeight:1.65,background:'#FDFAF5',padding:'10px 12px',borderRadius:7,border:'1px solid #E8E4DC'}}>{item.note}</div>
              </div>

              {item.status==='pending' && !showReject && (
                <div style={{display:'flex',gap:8}}>
                  <button style={{flex:2,padding:11,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:8,fontSize:13,fontWeight:600,cursor:'pointer',opacity:paying?.6:1}} disabled={paying} onClick={()=>approvePayout(item.id)}>
                    {paying?'Sending to MoMo…':'Approve & pay →'}
                  </button>
                  <button style={{flex:1,padding:11,background:'transparent',color:'#C0392B',border:'1px solid #C0392B',borderRadius:8,fontSize:13,fontWeight:500,cursor:'pointer'}} onClick={()=>setShowReject(true)}>Reject</button>
                </div>
              )}
              {showReject && (
                <div>
                  <label style={{fontSize:12,fontWeight:600,color:'#4A4A44',display:'block',marginBottom:6}}>Reason (sent to campaigner)</label>
                  <textarea style={{width:'100%',padding:10,border:'1.5px solid #C0392B',borderRadius:8,fontSize:12,minHeight:70,resize:'vertical',marginBottom:8}} placeholder="e.g. Please provide a clearer receipt with the supplier's name" value={rejectNote} onChange={e=>setRejectNote(e.target.value)}/>
                  <div style={{display:'flex',gap:8}}>
                    <button style={{flex:1,padding:10,background:'#C0392B',color:'#fff',border:'none',borderRadius:8,fontSize:12,fontWeight:600,cursor:'pointer'}} onClick={()=>rejectProof(item.id)}>Send rejection</button>
                    <button style={{padding:'10px 14px',background:'transparent',border:'1px solid #E8E4DC',borderRadius:8,fontSize:11,cursor:'pointer'}} onClick={()=>setShowReject(false)}>Cancel</button>
                  </div>
                </div>
              )}
              {item.status==='approved' && <div style={{fontSize:13,color:'#0A6B4B',background:'#E8F5EF',padding:10,borderRadius:8,textAlign:'center'}}>✓ Paid — ₵{item.amount.toLocaleString()} sent to {item.network}</div>}
            </div>
          ) : (
            <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:40,textAlign:'center',color:'#8A8A82',fontSize:13}}>Select a proof submission to review</div>
          )}
        </div>
      </div>
    </>
  );
}
