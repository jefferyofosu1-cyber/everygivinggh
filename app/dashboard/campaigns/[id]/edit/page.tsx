'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

type Milestone = { id: string; name: string; amount: number; status: 'released'|'collecting'|'pending' };
type Campaign = {
  title: string; story: string; goalAmount: number; raisedAmount: number;
  firstDonationReceived: boolean; milestones: Milestone[];
  category: string; coverImg: string; milestonePercentage: number;
};

export default function CampaignEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClient();
  const [form, setForm] = useState<Campaign | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<'story'|'photo'|'milestones'>('story');

  useEffect(() => {
    async function load() {
      const { data: c } = await supabase.from('campaigns').select('*').eq('id', params.id).single();
      if (c) {
        setForm({
          title: c.title || '',
          story: c.story || '',
          goalAmount: c.goal_amount || 0,
          raisedAmount: c.raised_amount || 0,
          firstDonationReceived: (c.raised_amount || 0) > 0,
          milestones: [],
          category: c.category || '',
          coverImg: c.image_url || '',
          milestonePercentage: c.milestone_percentage || 100
        });
      } else {
        router.push('/dashboard');
      }
    }
    load();
  }, [params.id, supabase, router]);

  function update(k: keyof Campaign, v: any) { setForm(f=>f ? {...f,[k]:v} : f); setDirty(true); setSaved(false); }
  function updateMs(id: string, k: keyof Milestone, v: any) {
    setForm(f=>f ? {...f,milestones:f.milestones.map(m=>m.id===id?{...m,[k]:v}:m)} : f);
    setDirty(true);
  }

  async function handleSave() {
    if (!form) return;
    setSaving(true);
    await supabase.from('campaigns').update({
      title: form.title,
      story: form.story,
      category: form.category,
      milestone_percentage: form.milestonePercentage
    }).eq('id', params.id);
    setSaving(false); setSaved(true); setDirty(false);
  }

  if (!form) return <div style={{padding:24, textAlign:'center'}}>Loading...</div>;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        button,input,textarea{font-family:inherit}
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
            <h3 style={{fontFamily:"'DM Serif Display',serif",fontSize:18,color:'#1A1A18',marginBottom:6}}>Payout Milestones</h3>
            <p style={{fontSize:12,color:'#8A8A82',marginBottom:16,lineHeight:1.6}}>Choose what percentage of your goal needs to be raised to unlock each payout. A smaller percentage means more frequent, smaller payouts.</p>
            
            <div style={{marginBottom: 20}}>
              <select 
                style={{width:'100%',padding:'10px 13px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:14,color:'#1A1A18',background:'#fff'}}
                value={form.milestonePercentage}
                onChange={e => update('milestonePercentage', Number(e.target.value))}
              >
                <option value={20}>20% (5 Payouts)</option>
                <option value={25}>25% (4 Payouts)</option>
                <option value={50}>50% (2 Payouts)</option>
                <option value={100}>100% (1 Payout at the end)</option>
              </select>
            </div>

            <div style={{background:'#F5F4F0',padding:16,borderRadius:9}}>
              <div style={{fontSize:13,fontWeight:600,color:'#1A1A18',marginBottom:8}}>Your Payout Schedule</div>
              <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
                {Array.from({length: Math.floor(100/form.milestonePercentage)}).map((_, i) => (
                  <div key={i} style={{flex:1,minWidth:120,background:'#fff',border:'1px solid #E8E4DC',padding:12,borderRadius:8,textAlign:'center'}}>
                    <div style={{fontSize:11,color:'#8A8A82',fontWeight:600,textTransform:'uppercase',marginBottom:4}}>Milestone {i+1}</div>
                    <div style={{fontSize:16,color:'#0A6B4B',fontWeight:700}}>₵{((form.goalAmount * form.milestonePercentage) / 100).toLocaleString(undefined, {minimumFractionDigits:0,maximumFractionDigits:0})}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
