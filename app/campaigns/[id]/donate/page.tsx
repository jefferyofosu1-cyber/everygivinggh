'use client';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

// ─── constants ────────────────────────────────────────────────────────────────
const PRESETS_LOCAL = [50, 100, 200, 500, 1000];
const NETWORKS = [
  { id:'mtn',    name:'MTN MoMo',     color:'#FFC107', textColor:'#5D4037' },
  { id:'voda',   name:'Vodafone Cash',color:'#E53935', textColor:'#fff'    },
  { id:'airtel', name:'AirtelTigo',   color:'#CC0033', textColor:'#fff'    },
];
const CURRENCIES = [
  { code:'GBP', symbol:'£', rate: 18.5, flag:'GBP' },
  { code:'USD', symbol:'$', rate: 14.2, flag:'USD' },
  { code:'EUR', symbol:'€', rate: 15.8, flag:'EUR' },
];
function getImpact(amt: number): string {
  if (amt >= 1000) return 'covers the first surgical milestone';
  if (amt >= 500)  return 'pays for a month of post-op medication';
  if (amt >= 200)  return 'covers transport costs to a major hospital';
  if (amt >= 100)  return 'helps feed a family during recovery';
  if (amt >= 50)   return 'helps buy essential medical supplies';
  return 'makes a real difference';
}

type CampaignData = {
  title: string; category: string;
  image_url: string | null; raised_amount: number; goal_amount: number;
  donor_count: number; verified: boolean;
  profiles?: { full_name: string };
};
const FALLBACK_CAMPAIGN: CampaignData = {
  title: 'Campaign', category: 'General',
  image_url: null, raised_amount: 0, goal_amount: 10000, donor_count: 0, verified: false,
  profiles: { full_name: 'Organiser' }
};

// ─── sub-components ──────────────────────────────────────────────────────────
function StepAmount({ mode, setMode, amount, setAmount, currency, setCurrency, onNext }: {
  mode: 'local'|'diaspora'; setMode: (m:'local'|'diaspora')=>void;
  amount: number; setAmount: (a:number)=>void;
  currency: typeof CURRENCIES[0]; setCurrency: (c:typeof CURRENCIES[0])=>void;
  onNext: ()=>void;
}) {
  const [customStr, setCustomStr] = useState('');
  const cur = CURRENCIES.find(c=>c.code===currency.code)!;
  const ghs = Math.round(amount * cur.rate);

  return (
    <div>
      {/* Mode toggle */}
      <div style={{display:'flex',gap:4,marginBottom:20,background:'var(--surface-alt)',borderRadius:10,padding:4}}>
        {(['local','diaspora'] as const).map(m=>(
          <button key={m} style={{flex:1,padding:9,borderRadius:7,border:'none',cursor:'pointer',fontSize:13,fontWeight:mode===m?600:400,background:mode===m?'var(--surface)':'transparent',color:mode===m?'var(--text-main)':'var(--text-muted)',boxShadow:mode===m?'0 1px 4px rgba(0,0,0,.09)':'none',transition:'all .15s',textTransform:'capitalize'}} onClick={()=>setMode(m)}>
            {m==='local'?'Ghana (MoMo)':'Abroad (Zeepay)'}
          </button>
        ))}
      </div>

      {mode==='diaspora' && (
        <div style={{marginBottom:16}}>
          <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:8}}>Currency</label>
          <div style={{display:'flex',gap:6}}>
            {CURRENCIES.map(c=>(
              <button key={c.code} style={{flex:1,padding:'9px 4px',borderRadius:8,border:`1.5px solid ${currency.code===c.code?'var(--primary)':'var(--border)'}`,background:currency.code===c.code?'var(--primary-light)':'var(--surface)',cursor:'pointer',fontSize:13,fontWeight:currency.code===c.code?700:400,color:currency.code===c.code?'var(--primary)':'var(--text-main)',transition:'all .15s'}} onClick={()=>setCurrency(c)}>
                {c.flag} {c.code}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{marginBottom:6}}>
        <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:8}}>
          {mode==='local'?'Choose amount (₵)':(`Amount (${currency.symbol})`)}
        </label>
        {mode==='local' ? (
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:7,marginBottom:10}}>
            {PRESETS_LOCAL.map(p=>(
              <button key={p} style={{padding:'10px 4px',borderRadius:8,border:`1.5px solid ${amount===p?'var(--primary)':'var(--border)'}`,background:amount===p?'var(--primary-light)':'var(--surface)',cursor:'pointer',fontSize:14,fontWeight:amount===p?700:500,color:amount===p?'var(--primary)':'var(--text-main)',transition:'all .15s'}} onClick={()=>{setAmount(p);setCustomStr('');}}>
                ₵{p}
              </button>
            ))}
          </div>
        ) : null}
        <div style={{display:'flex',alignItems:'center',border:'1.5px solid var(--border)',borderRadius:9,overflow:'hidden',background:'var(--surface)'}}>
          <span style={{padding:'0 12px',fontSize:16,fontWeight:600,color:'var(--text-muted)',borderRight:'1px solid var(--border)'}}>{mode==='local'?'₵':currency.symbol}</span>
          <input
            style={{flex:1,padding:'11px 12px',border:'none',fontSize:16,fontWeight:600,color:'var(--text-main)',background:'transparent',outline:'none'}}
            type="number" placeholder={mode==='local'?'Enter amount':'Enter amount'}
            value={customStr}
            onChange={e=>{setCustomStr(e.target.value);setAmount(Number(e.target.value)||0);}}
          />
        </div>
        {mode==='diaspora' && amount>0 && (
          <div style={{fontSize:12,color:'#8A8A82',marginTop:6}}>≈ ₵{ghs.toLocaleString()} GHS at today's rate</div>
        )}
      </div>

      {amount >= 50 && (
        <div style={{fontSize:13,color:'#0A6B4B',fontWeight:500,fontStyle:'italic',lineHeight:1.6,padding:'10px 0 0',animation:'fadeup .3s ease both'}}>
          {mode==='local'?'₵':currency.symbol}{amount} {getImpact(mode==='local'?amount:ghs)}
        </div>
      )}

      <button style={{display:'block',width:'100%',padding:14,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',opacity:amount>=50?1:.4,transition:'opacity .15s',marginTop:20}} disabled={amount<50} onClick={onNext}>
        Continue →
      </button>
      {amount>0 && amount<50 && <div style={{fontSize:11,color:'#B85C00',textAlign:'center',marginTop:7}}>Minimum donation is {mode==='local'?'₵':currency.symbol}50</div>}
    </div>
  );
}

function StepPayment({ mode, amount, currency, onNext, onBack, paymentData, setPaymentData }: {
  mode: 'local'|'diaspora'; amount: number; currency: typeof CURRENCIES[0];
  onNext: (data:any)=>void;
  onBack: ()=>void;
  paymentData: any;
  setPaymentData: (d:any)=>void;
}) {
  const [network, setNetwork] = useState(NETWORKS[0]);
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [intlPhone, setIntlPhone] = useState('');
  const validLocal = phone.length===10 && phone.startsWith('0');
  const validDiaspora = firstName.trim() && lastName.trim() && intlPhone.trim();

  return (
    <div>
      <button style={{fontSize:12,color:'#8A8A82',background:'transparent',border:'none',padding:0,cursor:'pointer',marginBottom:16}} onClick={onBack}>← Back</button>

      {mode==='local' ? (
        <div>
          <div style={{marginBottom:16}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:8}}>Mobile money network</label>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:7}}>
              {NETWORKS.map(n=>(
                <button key={n.id} style={{padding:11,borderRadius:9,border:`2px solid ${network.id===n.id?n.color:'var(--border)'}`,background:network.id===n.id?n.color+'18':'var(--surface)',cursor:'pointer',fontSize:12,fontWeight:network.id===n.id?700:400,color:network.id===n.id?n.color:'var(--text-main)',transition:'all .15s'}} onClick={()=>setNetwork(n)}>
                  {n.name}
                </button>
              ))}
            </div>
          </div>
          <div style={{marginBottom:12}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>Email address (for receipt)</label>
            <input style={{width:'100%',padding:'11px 13px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:15,background:'#fff',outline:'none',fontFamily:"'DM Sans',sans-serif"}} type="email" placeholder="kofi@example.com" value={paymentData.email || ''} onChange={e=>setPaymentData({...paymentData, email: e.target.value})}/>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:6}}>Your {network.name} number</label>
            <input style={{width:'100%',padding:'11px 13px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:15,background:'#fff',outline:'none',fontFamily:"'DM Sans',sans-serif"}} type="tel" placeholder="024 XXX XXXX" value={phone} onChange={e=>setPhone(e.target.value.replace(/\D/g,'').slice(0,10))}/>
            {phone.length>0 && !validLocal && <div style={{fontSize:11,color:'#C0392B',marginTop:4}}>Enter a valid 10-digit Ghana number starting with 0</div>}
          </div>
          <div style={{background:'var(--surface-alt)',borderRadius:9,padding:'11px 13px',marginBottom:20}}>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,marginBottom:4}}>
              <span style={{color:'var(--text-muted)'}}>Amount</span><span style={{fontWeight:700}}>₵{amount.toLocaleString()}</span>
            </div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13}}>
              <span style={{color:'var(--text-muted)'}}>Via</span><span style={{fontWeight:600}}>{network.name}</span>
            </div>
          </div>
          <button style={{display:'block',width:'100%',padding:13,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',opacity:validLocal && paymentData.email ? 1 : .4,transition:'opacity .15s'}} disabled={!validLocal || !paymentData.email} onClick={()=>onNext({...paymentData, network:network.id, phone})}>
            Donate ₵{amount.toLocaleString()} →
          </button>
        </div>
      ) : (
        <div>
          <div style={{background:'#E6F1FB',padding:'12px 14px',borderRadius:9,marginBottom:16}}>
            <div style={{fontSize:12,fontWeight:600,color:'#185FA5',marginBottom:4}}>Paying via Zeepay</div>
            <div style={{fontSize:12,color:'#4A4A44',lineHeight:1.65}}>You'll be charged {currency.symbol}{amount} {currency.code}. The organiser receives the GHS equivalent same day after our team processes it.</div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:12}}>
            <div><label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:5}}>First name</label><input style={{width:'100%',padding:'10px 12px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:13,outline:'none'}} value={firstName} onChange={e=>setFirstName(e.target.value)}/></div>
            <div><label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:5}}>Last name</label><input style={{width:'100%',padding:'10px 12px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:13,outline:'none'}} value={lastName} onChange={e=>setLastName(e.target.value)}/></div>
          </div>
          <div style={{marginBottom:20}}>
            <label style={{display:'block',fontSize:12,fontWeight:600,color:'#4A4A44',marginBottom:5}}>International phone number (with country code)</label>
            <input style={{width:'100%',padding:'10px 12px',border:'1.5px solid #E8E4DC',borderRadius:9,fontSize:13,outline:'none'}} placeholder="+44 7700 000000" value={intlPhone} onChange={e=>setIntlPhone(e.target.value)}/>
          </div>
          <button style={{display:'block',width:'100%',padding:13,background:'#0A6B4B',color:'#fff',border:'none',borderRadius:10,fontSize:15,fontWeight:700,cursor:'pointer',opacity:validDiaspora?1:.4,transition:'opacity .15s'}} disabled={!validDiaspora} onClick={()=>onNext({firstName,lastName,intlPhone})}>
            Pay {currency.symbol}{amount} via Zeepay →
          </button>
        </div>
      )}
    </div>
  );
}

function StepProcessing({ 
  amount, 
  campaignId, 
  paymentData, 
  currency, 
  mode 
}: { 
  amount: number; 
  campaignId: string;
  paymentData: any;
  currency: any;
  mode: 'local'|'diaspora';
}) {
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    async function initializePayment() {
      try {
        // Only Paystack (local) is implemented for now as per the plan
        if (mode === 'diaspora') {
          setError('Zeepay integration is coming soon. Please use Mobile Money for now.');
          setIsInitializing(false);
          return;
        }

        const response = await fetch('/api/paystack/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: amount,
            email: paymentData.email || 'donor@everygiving.org', // Fallback for testing, should be collected
            campaignId: campaignId,
            donorName: paymentData.firstName ? `${paymentData.firstName} ${paymentData.lastName}` : 'Anonymous',
            // donorId can be added if user is logged in
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to initialize payment');
        }

        if (data.payment?.authorizationUrl) {
          // Redirect to Paystack
          window.location.href = data.payment.authorizationUrl;
        } else {
          throw new Error('Invalid response from payment server');
        }
      } catch (err: any) {
        console.error('[Payment Init Error]:', err);
        setError(err.message || 'An unexpected error occurred');
        setIsInitializing(false);
      }
    }

    initializePayment();
  }, [amount, campaignId, paymentData, mode]);

  return (
    <div style={{textAlign:'center',padding:'40px 0'}}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin{to{transform:rotate(360deg)}}
      ` }} />
      {isInitializing ? (
        <>
          <div style={{width:48,height:48,margin:'0 auto 24px',borderRadius:'50%',border:'3px solid #E8E4DC',borderTopColor:'#0A6B4B',animation:'spin 1s linear infinite'}}/>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'#1A1A18',marginBottom:8}}>Securing your donation...</div>
          <div style={{fontSize:14,color:'#8A8A82'}}>You are being redirected to our secure payment partner, Paystack.</div>
        </>
      ) : (
        <>
          <div style={{fontSize:48,marginBottom:16}}></div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:22,color:'#C0392B',marginBottom:12}}>Payment failed to start</div>
          <div style={{fontSize:14,color:'#4A4A44',lineHeight:1.6,marginBottom:24,maxWidth:320,margin:'0 auto'}}>{error}</div>
          <button 
            style={{padding:'12px 24px',background:'#F5F4F0',border:'1px solid #E8E4DC',borderRadius:10,fontSize:14,fontWeight:600,cursor:'pointer'}}
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
        </>
      )}
    </div>
  );
}

function StepConfirmation({ amount, mode, campaign, currency, paymentData }: {
  amount: number; mode: 'local'|'diaspora'; campaign: CampaignData;
  currency: typeof CURRENCIES[0]; paymentData: Record<string,string>;
}) {
  const pct = Math.round(((campaign.raised_amount || 0) + (mode==='local'?amount:amount*currency.rate)) / (campaign.goal_amount || 1) * 100);
  return (
    <div style={{animation:'fadeup .4s ease both'}}>
      <div style={{position:'relative',height:200,borderRadius:12,overflow:'hidden',marginBottom:-30}}>
        {campaign.image_url && <img src={campaign.image_url} style={{width:'100%',height:'100%',objectFit:'cover'}} alt=""/>}
        <div style={{position:'absolute',inset:0,background:'linear-gradient(to bottom, rgba(10,107,75,.55), rgba(10,107,75,.82))'}}/>
        <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
          <div style={{width:48,height:48,borderRadius:'50%',background:'rgba(255,255,255,.18)',border:'2px solid rgba(255,255,255,.6)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,marginBottom:8}}>✓</div>
          <div style={{fontFamily:"'DM Serif Display',serif",fontSize:24,color:'#fff',textAlign:'center',lineHeight:1.3}}>Thank you, {paymentData.firstName||'friend'}!</div>
          <div style={{fontSize:15,color:'rgba(255,255,255,.85)',marginTop:4}}>₵{(mode==='local'?amount:Math.round(amount*currency.rate)).toLocaleString()} donated</div>
        </div>
      </div>

      <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'40px 20px 20px',marginBottom:14}}>
        <div style={{fontSize:14,color:'var(--primary)',fontStyle:'italic',lineHeight:1.8,textAlign:'center',marginBottom:20}}>
          "Because of people like you, Ama's surgery is one step closer to happening. You may never meet her, but you've changed her story today."
        </div>

        {/* Updated progress */}
        <div style={{marginBottom:16}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,color:'var(--text-muted)',marginBottom:5}}>
            <span>Campaign progress</span><span style={{color:'var(--primary)',fontWeight:600}}>{Math.min(pct,100)}%</span>
          </div>
          <div style={{height:7,background:'var(--border)',borderRadius:4,overflow:'hidden'}}>
            <div style={{height:'100%',background:'var(--primary)',borderRadius:4,width:`${Math.min(pct,100)}%`,transition:'width 1.2s ease'}}/>
          </div>
          <div style={{fontSize:11,color:'var(--text-muted)',marginTop:3}}>{(campaign.donor_count||0)+1} donors · ₵{((campaign.raised_amount||0)+(mode==='local'?amount:Math.round(amount*currency.rate))).toLocaleString()} raised</div>
        </div>

        {/* Receipt */}
        <div style={{background:'var(--surface-alt)',borderRadius:9,padding:14,marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',marginBottom:8,textTransform:'uppercase',letterSpacing:'.06em'}}>Receipt</div>
          {[
            ['Amount donated', mode==='local'?`₵${amount.toLocaleString()}`:`${currency.symbol}${amount} ${currency.code}`],
            ['To', campaign.title.slice(0,50)+(campaign.title.length>50?'…':'')],
            ['Organiser', campaign.profiles?.full_name || 'Anonymous'],
            ['Payment via', mode==='local'?'MTN MoMo':'Zeepay'],
            ['Status', 'Received & processing'],
          ].map(([l,v],i)=>(
            <div key={i} style={{display:'flex',justifyContent:'space-between',fontSize:12,paddingBottom:6,marginBottom:6,borderBottom:'1px solid var(--border)'}}>
              <span style={{color:'var(--text-muted)'}}>{l}</span>
              <span style={{fontWeight:500,color:'var(--text-main)',textAlign:'right',maxWidth:'56%'}}>{v}</span>
            </div>
          ))}
        </div>

        <div style={{display:'flex',gap:8}}>
          <a style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:6,padding:12,background:'#25D366',color:'#fff',borderRadius:9,fontSize:13,fontWeight:600,textDecoration:'none'}}
            href={`https://api.whatsapp.com/send?text=I just donated to help Ama get surgery. Join me: https://everygiving.gh/c/${campaign.title.toLowerCase().replace(/\s+/g,'-')}`}
            target="_blank" rel="noopener noreferrer">
            Share on WhatsApp
          </a>
          <Link href="/campaigns" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:12,border:'1px solid #E8E4DC',borderRadius:9,fontSize:13,fontWeight:500,color:'#4A4A44',textDecoration:'none'}}>
            Explore campaigns
          </Link>
        </div>
      </div>

      <div style={{background:'var(--primary-light)',border:'1px solid var(--primary)',borderRadius:9,padding:'11px 14px',fontSize:12,color:'var(--primary)',lineHeight:1.65}}>
                Your donation is milestone-protected. Funds are released in stages — only after the organiser proves each step was completed.
      </div>
    </div>
  );
}

// ─── main DonationFlow ────────────────────────────────────────────────────────
export default function DonatePage({ params }: { params: { id: string } }) {
  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<'local'|'diaspora'>('local');
  const [amount, setAmount] = useState(0);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [paymentData, setPaymentData] = useState<Record<string,string>>({});
  const [campaign, setCampaign] = useState<CampaignData>(FALLBACK_CAMPAIGN);

  // Fetch real campaign from Supabase
  useEffect(() => {
    if (!params.id) return;
    const supabase = createClient();
    supabase
      .from('campaigns')
      .select('title, category, image_url, raised_amount, goal_amount, donor_count, verified, profiles(full_name)')
      .or(`id.eq.${params.id},slug.eq.${params.id}`)
      .single()
      .then(({ data }) => {
        if (data) {
          const d = data as any;
          setCampaign({
            ...d,
            profiles: Array.isArray(d.profiles) ? d.profiles[0] : d.profiles
          });
        }
      });
  }, [params.id]);

  const handlePaymentNext = useCallback((data: Record<string,string>) => {
    setPaymentData(data);
    setStep(3);
  }, []);
  const handleConfirmed = useCallback(() => { setStep(4); }, []);
  const handleFailed = useCallback(() => { setStep(2); }, []);

  const showProgress = step < 4;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        body{background:var(--surface-alt);color:var(--text-main)}
        button,input{font-family:inherit}
        input:focus{outline:none;border-color:var(--primary)!important}
        @keyframes fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
      ` }} />

      <div style={{maxWidth:860,margin:'0 auto',padding:'24px 24px 64px',display:'grid',gridTemplateColumns:step<4?'1fr 280px':'1fr',gap:24,alignItems:'start'}}>
        {/* Left — form */}
        <div>
          {/* Progress dots */}
          {showProgress && (
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:22}}>
              {[{n:1,l:'Amount'},{n:2,l:'Payment'},{n:3,l:'Confirm'}].map((s,i)=>(
                <div key={s.n} style={{display:'flex',alignItems:'center',gap:8}}>
                  {i > 0 ? <div style={{height:1,width:18,background:step>i?'#0A6B4B':'#E8E4DC'}}/> : null}
                  <div style={{display:'flex',alignItems:'center',gap:5}}>
                    <div style={{width:22,height:22,borderRadius:'50%',background:step===s.n?'#0A6B4B':step>s.n?'#B7DEC9':'#E8E4DC',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,color:step>=s.n?'#fff':'#8A8A82',transition:'all .2s'}}>{step>s.n?'✓':s.n}</div>
                    <div style={{fontSize:11,fontWeight:step===s.n?700:400,color:step===s.n?'#1A1A18':'#8A8A82'}}>{s.l}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'22px 20px'}}>
            {step===1 && <StepAmount mode={mode} setMode={setMode} amount={amount} setAmount={setAmount} currency={currency} setCurrency={setCurrency} onNext={()=>setStep(2)}/>}
            {step===2 && <StepPayment mode={mode} amount={amount} currency={currency} onNext={handlePaymentNext} onBack={()=>setStep(1)} paymentData={paymentData} setPaymentData={setPaymentData}/>}
            {step===3 && <StepProcessing amount={amount} campaignId={params.id} paymentData={paymentData} currency={currency} mode={mode}/>}
            {step===4 && <StepConfirmation amount={amount} mode={mode} campaign={campaign} currency={currency} paymentData={paymentData}/>}
          </div>
        </div>

        {/* Right — campaign summary (steps 1-3 only) */}
        {showProgress && (
          <div style={{position:'sticky',top:72}}>
            <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,overflow:'hidden',marginBottom:10}}>
              {campaign.image_url && <img src={campaign.image_url} style={{width:'100%',height:130,objectFit:'cover',display:'block'}} alt=""/>}
              <div style={{padding:'12px 14px'}}>
                <div style={{fontSize:13,fontWeight:600,color:'var(--text-main)',lineHeight:1.4,marginBottom:6}}>{campaign.title}</div>
                <div style={{fontSize:11,color:'var(--text-muted)',marginBottom:8}}>By {campaign.profiles?.full_name || 'Anonymous'} · {campaign.category}</div>
                <div style={{height:4,background:'var(--border)',borderRadius:2,overflow:'hidden',marginBottom:4}}>
                  <div style={{height:'100%',background:'var(--primary)',borderRadius:2,width:`${Math.round((campaign.raised_amount||0)/(campaign.goal_amount||1)*100)}%`}}/>
                </div>
                <div style={{fontSize:11,color:'var(--text-muted)'}}>₵{(campaign.raised_amount||0).toLocaleString()} raised · {campaign.donor_count||0} donors</div>
              </div>
            </div>

            <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 14px',marginBottom:10}}>
              {[
                {icon:'',label:'Verified campaign'},
                {icon:'',label:'Milestone-protected'},
                {icon:'',label:'Secure payment'},
              ].map((t,i)=>(
                <div key={i} style={{display:'flex',gap:8,alignItems:'center',marginBottom:i<2?8:0}}>
                  <div style={{fontSize:14}}>{t.icon}</div>
                  <div style={{fontSize:12,fontWeight:500,color:'var(--text-main)'}}>{t.label}</div>
                </div>
              ))}
            </div>

            <div style={{fontSize:10,color:'#C8C4BC',textAlign:'center',lineHeight:1.5}}>Payments powered by Paystack and Zeepay</div>
          </div>
        )}
      </div>
    </>
  );
}
