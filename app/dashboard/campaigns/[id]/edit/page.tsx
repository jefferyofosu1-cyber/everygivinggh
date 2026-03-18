'use client';
import { useState } from 'react';
import Link from 'next/link';

type Milestone = { id: string; name: string; amount: number; status: 'released'|'collecting'|'pending' };
type Campaign = {
  title: string; story: string; goalAmount: number; raisedAmount: number;
  firstDonationReceived: boolean; milestones: Milestone[];
  category: string; coverImg: string;
};

const MOCK: Campaign = {
  title: 'Help Ama get life-saving kidney surgery at Korle Bu',
  story: 'My mother Ama is 54 years old. She has woken up at 4am every day for thirty years to sell at Makola Market so her children could go to school. Last month she collapsed and was diagnosed with kidney disease and needs surgery within 90 days to survive.',
  goalAmount: 20000, raisedAmount: 14400, firstDonationReceived: true,
  milestones: [
    {id:'m1',name:'Hospital deposit',amount:5000,status:'released'},
    {id:'m2',name:'Surgery fees',amount:12000,status:'collecting'},
    {id:'m3',name:'Post-op care',amount:3000,status:'pending'},
  ],
  category: 'Medical',
  coverImg: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=480&q=80',
};

export default function CampaignEditorPage({ params }: { params: { id: string } }) {
  const [form, setForm] = useState<Campaign>({...MOCK, milestones:[...MOCK.milestones]});
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'story'|'photo'|'milestones'>('story');

  function update(k: keyof Campaign, v: any) { setForm(f=>({...f,[k]:v})); setDirty(true); setSaved(false); }
  function updateMs(id: string, k: keyof Milestone, v: any) {
    setForm(f=>({...f,milestones:f.milestones.map(m=>m.id===id?{...m,[k]:v}:m)}));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    // TODO: PATCH /api/campaigns/:id
    await new Promise(r=>setTimeout(r,700));
    setSaving(false); setSaved(true); setDirty(false);
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{font-family:'DM Sans',sans-serif;background:#F5F4F0;color:#1A1A18}
        a{text-decoration:none;color:inherit}
        button,input,textarea{font-family:'DM Sans',sans-serif}
        input:focus,textarea:focus{outline:none;border-color:#0A6B4B!important}
      ` }} />

      <div style={{maxWidth:860,margin:'0 auto',padding:'24px 24px 80px'}}>
        <div style={{display:'flex',gap:4,marginBottom:20,background:'#fff',border:'1px solid #E8E4DC',borderRadius:10,padding:4}}>
          {(['story','photo','milestones'] as const).map(t=>(
            <button key={t} style={{flex:1,padding:9,borderRadius:7,border:'none',cursor:'pointer',fontSize:13,fontWeight:tab===t?600:400,background:tab===t?'#1A1A18':'transparent',color:tab===t?'#fff':'#8A8A82',textTransform:'capitalize',transition:'all .15s'}} onClick={()=>setTab(t)}>
              {t}
            </button>
          ))}
        </div>

        {tab==='story' && (
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:22}}>
            <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:16}}>Story</h3>
            <div style={{marginBottom:16}}>
              <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>Campaign title</label>
              <input style={{width:'100%',padding:'10px 13px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:14,color:'#1A1A18'}} value={form.title} onChange={e=>update('title',e.target.value)} maxLength={100}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>Your story</label>
              <textarea style={{width:'100%',padding:'11px 13px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:13,lineHeight:1.75,minHeight:200,resize:'vertical'}} value={form.story} onChange={e=>update('story',e.target.value)}/>
            </div>
            {form.firstDonationReceived && (
              <div style={{fontSize:12,color:'#B85C00',background:'#FEF3E2',padding:'10px 12px',borderRadius:8,marginTop:12}}>
                ⚠ Goal amount cannot be changed after the first donation is received (₵{form.raisedAmount.toLocaleString()} raised so far).
              </div>
            )}
          </div>
        )}

        {tab==='photo' && (
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:22}}>
            <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:16}}>Cover photo</h3>
            <div style={{position:'relative',height:240,borderRadius:10,overflow:'hidden',marginBottom:16}}>
              <img src={form.coverImg} style={{width:'100%',height:'100%',objectFit:'cover',display:'block'}} alt="Cover"/>
              <button style={{position:'absolute',bottom:10,right:10,fontSize:12,fontWeight:600,color:'#fff',background:'rgba(0,0,0,.55)',border:'none',padding:'7px 14px',borderRadius:7,cursor:'pointer'}}>Change photo</button>
            </div>
            <div style={{fontSize:12,color:'#8A8A82',lineHeight:1.65}}>Adding a new photo does not re-send notifications to donors. They'll see it when they next visit your campaign page.</div>
          </div>
        )}

        {tab==='milestones' && (
          <div style={{background:'#fff',border:'1px solid #E8E4DC',borderRadius:12,padding:22}}>
            <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:6}}>Milestones</h3>
            <p style={{fontSize:12,color:'#8A8A82',marginBottom:16,lineHeight:1.6}}>You can edit milestones that haven't been triggered yet. Released and collecting milestones are locked.</p>
            {form.milestones.map((ms,i)=>{
              const locked = ms.status==='released'||ms.status==='collecting';
              const dotBg = ms.status==='released'?'#0A6B4B':ms.status==='collecting'?'#B85C00':'#E8E4DC';
              const dotColor = ms.status!=='pending'?'#fff':'#8A8A82';
              const pillColor = ms.status==='released'?'#0A6B4B':ms.status==='collecting'?'#B85C00':'#8A8A82';
              const pillBg = ms.status==='released'?'#E8F5EF':ms.status==='collecting'?'#FEF3E2':'#F2F3F4';
              return (
                <div key={ms.id} style={{display:'flex',gap:10,alignItems:'center',marginBottom:10,padding:12,background:locked?'#F5F4F0':'#fff',border:'1px solid #E8E4DC',borderRadius:9}}>
                  <div style={{width:22,height:22,borderRadius:'50%',background:dotBg,color:dotColor,fontSize:10,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</div>
                  <input style={{flex:2,padding:'8px 10px',border:'1.5px solid #E8E4DC',borderRadius:7,fontSize:13,color:'#1A1A18',background:locked?'#F5F4F0':'#fff'}} value={ms.name} onChange={e=>updateMs(ms.id,'name',e.target.value as any)} disabled={locked}/>
                  <div style={{display:'flex',alignItems:'center',border:'1.5px solid #E8E4DC',borderRadius:7,background:locked?'#F5F4F0':'#fff',overflow:'hidden',flex:1}}>
                    <span style={{fontSize:13,fontWeight:600,color:'#8A8A82',padding:'8px',borderRight:'1px solid #E8E4DC'}}>₵</span>
                    <input style={{flex:1,border:'none',padding:8,fontSize:13,background:'transparent',color:'#1A1A18'}} type="number" value={ms.amount} onChange={e=>updateMs(ms.id,'amount',Number(e.target.value))} disabled={locked}/>
                  </div>
                  <div style={{fontSize:10,fontWeight:700,color:pillColor,background:pillBg,padding:'3px 8px',borderRadius:20,flexShrink:0}}>{ms.status}</div>
                </div>
              );
            })}
            <div style={{fontSize:12,color:'#8A8A82',marginTop:8,lineHeight:1.6}}>Locked milestones (released or collecting) cannot be edited. Contact support if you need to make changes.</div>
          </div>
        )}
      </div>
    </>
  );
}
