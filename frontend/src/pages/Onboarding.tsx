import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, Pill, Zap, User, MapPin, Wallet, ArrowRight, ShieldCheck, Check, FileText, Download, ChevronLeft, Phone, Key } from 'lucide-react';
import { registerRider, loginRider, createPolicy, getPolicy } from '../api/client';

interface OnboardingProps {
  onComplete: (riderId: number) => void;
}

type Step = 'landing' | 'bio' | 'plans' | 'policy-doc';

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('landing');
  const [loading, setLoading] = useState(false);
  const [riderId, setRiderId] = useState<number | null>(null);

  const [isLoginMode, setIsLoginMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone_number: '',
    work_type: 'grocery' as 'grocery' | 'pharma' | 'essentials',
    zone: 'South Mumbai',
    avg_weekly_income: 5000
  });

  const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Pro' | 'Elite'>('Pro');
  const [policyData, setPolicyData] = useState<any>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const regRes = await registerRider(formData);
      setRiderId(regRes.data.id);
      setStep('plans');
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Registration failed. Check if phone number is unique.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const logRes = await loginRider(formData.phone_number);
      const rider = logRes.data;
      setRiderId(rider.id);
      
      // Check if they already have an active policy
      try {
        const polRes = await getPolicy(rider.id);
        if (polRes.data) {
          onComplete(rider.id);
        } else {
          setStep('plans');
        }
      } catch (polErr) {
        // No active policy, go to plans
        setStep('plans');
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || 'Login failed. Rider not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async () => {
    if (!riderId) return;
    setLoading(true);
    try {
      const polRes = await createPolicy(riderId, selectedPlan);
      setPolicyData(polRes.data);
      setStep('policy-doc');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    const win = window.open('', '_blank');
    if (!win || !policyData) return;
    win.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>DeliverSure Policy QC-77${policyData.id}-DS</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 56px; color: #1e293b; max-width: 820px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 24px; border-bottom: 2px solid #e2e8f0; margin-bottom: 36px; }
    .brand { font-size: 22px; font-weight: 900; letter-spacing: -0.5px; }
    .sub { font-size: 10px; color: #64748b; margin-top: 4px; letter-spacing: 2px; text-transform: uppercase; }
    .ref { text-align: right; font-size: 11px; color: #64748b; }
    .ref strong { font-size: 13px; color: #1e293b; font-weight: 700; }
    .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 32px; margin: 32px 0; }
    .lbl { font-size: 9px; text-transform: uppercase; letter-spacing: 3px; color: #94a3b8; margin-bottom: 6px; }
    .val { font-size: 18px; font-weight: 700; color: #1e293b; }
    .sub-val { font-size: 12px; color: #64748b; margin-top: 3px; text-transform: capitalize; }
    .highlight-box { background: #f8fafc; border-radius: 18px; padding: 28px 32px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #e2e8f0; margin: 24px 0; flex-wrap: wrap; gap: 24px; }
    .stat .num { font-size: 28px; font-weight: 900; color: #1e293b; }
    .stat .num.blue { color: #3b82f6; }
    .stat .num.sm { font-size: 17px; }
    .fine { font-size: 10px; color: #94a3b8; line-height: 1.7; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; }
    @media print { body { padding: 36px; } }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">DELIVERSURE</div>
      <div class="sub">Instant Parametric Shield &mdash; Quick Commerce</div>
    </div>
    <div class="ref">
      <strong>REF: QC-77${policyData.id}-DS</strong><br/>
      ISSUED: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
    </div>
  </div>
  <div class="grid3">
    <div><div class="lbl">Policy Holder</div><div class="val">${formData.name}</div><div class="sub-val">${formData.work_type} Specialist</div></div>
    <div><div class="lbl">Coverage Tier</div><div class="val">${selectedPlan} Protection</div><div class="sub-val">Auto-Trigger Settlements Enabled</div></div>
    <div><div class="lbl">Operating Zone</div><div class="val" style="text-transform:capitalize">${formData.zone}</div><div class="sub-val">Parametric Coverage Active</div></div>
  </div>
  <div class="highlight-box">
    <div class="stat"><div class="lbl">Weekly Premium</div><div class="num">&#8377;${policyData.weekly_premium}</div></div>
    <div class="stat"><div class="lbl">Max Coverage</div><div class="num blue">&#8377;${policyData.coverage_amount}</div></div>
    <div class="stat"><div class="lbl">Trigger Mode</div><div class="num sm">100% Zero-Touch</div></div>
    <div class="stat"><div class="lbl">Validity</div><div class="num sm">7 Days (Weekly)</div></div>
  </div>
  <div class="fine">
    This is a parametric microinsurance contract. Payouts are triggered automatically upon verified environmental events crossing defined thresholds:
    Rainfall &gt;5mm/hr &bull; AQI &gt;300 &bull; Traffic Index &gt;2.0x congestion multiplier.
    No manual claim filing required. Funds disbursed to registered UPI within 30 seconds of trigger confirmation.
    Governed by IRDAI Parametric Insurance Framework 2024. Authorized Digital Signature: Node-11.
  </div>
</body>
</html>`);
    win.document.close();
    setTimeout(() => win.print(), 400);
  };

  const handleViewTerms = () => {
    alert(
      'DELIVERSURE — POLICY TERMS\n\n' +
      '1. PARAMETRIC TRIGGER\n' +
      'Payouts are automatic upon verified environmental events:\n' +
      '\u2022 Rainfall > 5mm/hr\n\u2022 AQI > 300\n\u2022 Traffic > 2.0x congestion multiplier\n\n' +
      '2. COVERAGE PERIOD\n' +
      '7-day rolling weekly contract. Auto-renews each Monday at midnight.\n\n' +
      '3. PAYOUT CAPS\n' +
      'Max payout per event = % of plan coverage amount. Lifetime cap = total coverage amount.\n\n' +
      '4. EXCLUSIONS\n' +
      'Acts of terrorism, political unrest, or willful negligence are excluded.\n\n' +
      '5. SETTLEMENT\n' +
      'Funds dispatched to registered UPI within 30 seconds of trigger confirmation. No manual filing required.\n\n' +
      '6. DISPUTES\n' +
      'All disputes governed by IRDAI Parametric Insurance Framework 2024.\n\n' +
      'By activating this policy you agree to the above terms.'
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-6 bg-slate-50/50 overflow-hidden relative">
      {/* Background Pastel Gradients */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-green-100/30 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {/* ─── LANDING HERO ─── */}
        {step === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-5xl z-10 flex flex-col items-center text-center"
          >
            {/* Headlines */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 border border-blue-100 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-500 mb-6">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                Live Coverage · 4 Zones Active
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-slate-900 mb-4 leading-none">
                Instant Income Shield<br />
                <span className="premium-gradient-text">Across Fast India</span>
              </h1>
              <p className="text-slate-400 text-base max-w-lg mx-auto leading-relaxed mb-10">
                DeliverSure's parametric engine monitors weather, AQI &amp; traffic — and triggers<br />
                automatic payouts to quick-commerce riders the moment conditions breach thresholds.
              </p>
            </motion.div>



            {/* ── Floating Brand Bubbles ── */}
            <motion.div
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full flex flex-col items-center"
            >
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-6">
                Protecting riders delivering for
              </p>

              <div className="flex items-center justify-center gap-5 md:gap-8 mb-10">

                {/* Blinkit */}
                <motion.div animate={{ y: [0,-10,0] }} transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }} className="flex flex-col items-center gap-2.5 cursor-default group">
                  <div className="w-20 h-20 rounded-2xl shadow-lg border-2 border-yellow-300 transition-transform group-hover:scale-110 duration-200 overflow-hidden flex items-center justify-center" style={{ background: '#F8D90F' }}>
                    <span style={{ fontFamily: 'Arial Black, sans-serif', fontSize: '15px', fontWeight: 900, color: '#1a1a1a', letterSpacing: '-0.5px' }}>
                      blink<span style={{ color: '#1a8a1a' }}>it</span>
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-yellow-700">blinkit</span>
                </motion.div>

                {/* Zepto */}
                <motion.div animate={{ y: [0,-10,0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }} className="flex flex-col items-center gap-2.5 cursor-default group">
                  <div className="w-20 h-20 rounded-2xl shadow-lg border-2 border-purple-700 transition-transform group-hover:scale-110 duration-200 overflow-hidden flex items-center justify-center" style={{ background: '#3d0066' }}>
                    <span style={{ fontFamily: 'Arial Rounded MT Bold, Arial, sans-serif', fontSize: '17px', fontWeight: 800, background: 'linear-gradient(135deg, #ff6b6b, #ff9f43)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      zepto
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-purple-800">zepto</span>
                </motion.div>

                {/* Swiggy */}
                <motion.div animate={{ y: [0,-10,0] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.7 }} className="flex flex-col items-center gap-2.5 cursor-default group">
                  <div className="w-20 h-20 rounded-full shadow-lg border-2 border-orange-400 transition-transform group-hover:scale-110 duration-200 overflow-hidden flex flex-col items-center justify-center gap-0.5" style={{ background: '#E2681E' }}>
                    <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '22px', fontWeight: 900, color: 'white', lineHeight: 1 }}>S</span>
                    <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '7px', fontWeight: 900, color: 'white', letterSpacing: '2px' }}>SWIGGY</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-orange-800">swiggy</span>
                </motion.div>

                {/* BigBasket */}
                <motion.div animate={{ y: [0,-10,0] }} transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1.0 }} className="flex flex-col items-center gap-2.5 cursor-default group">
                  <div className="w-20 h-20 rounded-2xl shadow-lg border-2 border-green-400 transition-transform group-hover:scale-110 duration-200 overflow-hidden flex flex-col items-center justify-center" style={{ background: '#84BB22' }}>
                    <span style={{ fontFamily: 'Georgia, serif', fontSize: '22px', fontWeight: 900, lineHeight: 1 }}>
                      <span style={{ color: '#c0392b' }}>b</span><span style={{ color: '#1a1a1a' }}>b</span>
                    </span>
                    <span style={{ fontFamily: 'Arial, sans-serif', fontSize: '6.5px', fontWeight: 700, color: '#1a1a1a', letterSpacing: '0.5px', marginTop: '2px' }}>bigbasket</span>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-green-800">bigbasket</span>
                </motion.div>

              </div>

              {/* CTA */}
              <button
                onClick={() => { setStep('bio'); setIsLoginMode(false); }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-14 py-5 rounded-full font-black text-lg shadow-2xl shadow-blue-200 group flex items-center gap-4 mx-auto active:scale-95 transition-all mb-4"
              >
                Get Protected Today
                <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
              </button>

              <button
                onClick={() => { setStep('bio'); setIsLoginMode(true); }}
                className="text-slate-400 hover:text-blue-500 font-bold text-sm transition-colors"
              >
                Already a member? <span className="underline decoration-slate-200 hover:decoration-blue-200">Sign In</span>
              </button>
            </motion.div>
          </motion.div>
        )}

        {/* ─── BIO STEP ─── */}
        {step === 'bio' && (
          <motion.div
            key="bio"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="glass-card w-full max-w-lg p-8 md:p-10 relative z-10 bg-white"
          >
            <div className="flex flex-col items-center mb-10 text-center">
              <div className={`p-4 ${isLoginMode ? 'bg-blue-500' : 'bg-green-500'} rounded-3xl shadow-lg shadow-blue-100 mb-6`}>
                {isLoginMode ? <Key className="w-10 h-10 text-white" /> : <ShoppingBag className="w-10 h-10 text-white" />}
              </div>
              <h1 className="text-3xl font-black tracking-tight mb-2 premium-gradient-text">DeliverSure</h1>
              <p className="text-slate-500 text-sm">
                {isLoginMode ? 'Welcome Back Protector' : 'Join the Quick Commerce Elite: Protect Your Daily Earnings'}
              </p>
            </div>

            <form onSubmit={isLoginMode ? handleLogin : handleRegister} className="space-y-6 text-slate-700">
              {/* Phone Number - Modern Input */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="tel"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:border-blue-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                    placeholder="Enter phone number"
                    value={formData.phone_number}
                    onChange={e => setFormData({ ...formData, phone_number: e.target.value })}
                  />
                </div>
              </div>

              {!isLoginMode && (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Rider Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-slate-800 focus:border-blue-400 focus:bg-white outline-none transition-all placeholder:text-slate-300"
                        placeholder="Enter full name"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'grocery',    label: 'Grocery', icon: <ShoppingBag className="w-5 h-5" /> },
                      { id: 'pharma',     label: 'Pharma',  icon: <Pill className="w-5 h-5" /> },
                      { id: 'essentials', label: 'Flash',   icon: <Zap  className="w-5 h-5" /> },
                    ].map((type) => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setFormData({ ...formData, work_type: type.id as any })}
                        className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${formData.work_type === type.id ? 'bg-green-50 border-green-200 text-green-600 shadow-sm' : 'bg-slate-50 border-slate-50 text-slate-400 hover:bg-slate-100'}`}
                      >
                        {type.icon}
                        <span className="text-[9px] font-bold uppercase tracking-widest">{type.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Operating Zone</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <select
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-slate-800 outline-none appearance-none cursor-pointer"
                          value={formData.zone}
                          onChange={e => setFormData({ ...formData, zone: e.target.value })}
                        >
                          <option value="South Mumbai">South Mumbai</option>
                          <option value="Bandra West">Bandra West</option>
                          <option value="Connaught Place">Connaught Place</option>
                          <option value="Electronic City">Electronic City</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Weekly Earnings</label>
                      <div className="relative">
                        <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 pl-10 pr-4 text-slate-800 outline-none"
                          value={formData.avg_weekly_income}
                          onChange={e => setFormData({ ...formData, avg_weekly_income: Number(e.target.value) })}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-5 rounded-3xl font-bold flex items-center justify-center gap-2 group shadow-xl shadow-blue-100 transition-all"
              >
                {loading ? (isLoginMode ? 'Logging In...' : 'Verifying Details...') : (
                  <>
                    {isLoginMode ? 'Sign In to Dashboard' : 'Compare Coverage Plans'}
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="text-center">
                <button 
                  type="button"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                  className="text-xs font-bold text-slate-400 hover:text-blue-500 transition-colors"
                >
                  {isLoginMode ? "New here? Create an account" : "Already have an account? Sign In"}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {step === 'plans' && (
          <motion.div
            key="plans"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full max-w-5xl z-10"
          >
            <div className="text-center mb-12">
              <button
                onClick={() => setStep('bio')}
                className="mb-4 text-slate-400 hover:text-slate-600 flex items-center gap-2 mx-auto transition-colors text-xs font-bold uppercase tracking-tight"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Profile
              </button>
              <h2 className="text-4xl font-black mb-3 premium-gradient-text tracking-tight">Select Your Coverage Tier</h2>
              <p className="text-slate-500">Optimized for high-frequency quick commerce routes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  id: 'Starter', title: 'Starter', coverage: '60%',
                  color: 'bg-green-500', perks: ['Rain Protection', 'AQI Alerts'],
                  desc: 'For part-time flash delivery.'
                },
                {
                  id: 'Pro', title: 'Professional', coverage: '80%',
                  color: 'bg-orange-500', perks: ['Rain + Traffic Coverage', 'Priority Settlement', 'Full Dash'],
                  desc: 'Balanced protection for daily pros.'
                },
                {
                  id: 'Elite', title: 'The Elite', coverage: '100%',
                  color: 'bg-purple-500', perks: ['Full Income Shield', 'VIP Concierge', 'Family Add-on'],
                  desc: 'Maximum security for QC leads.'
                },
              ].map((plan) => (
                <motion.div
                  key={plan.id}
                  whileHover={{ y: -8 }}
                  onClick={() => setSelectedPlan(plan.id as any)}
                  className={`p-1 rounded-[38px] transition-all cursor-pointer ${selectedPlan === plan.id ? 'bg-gradient-to-br from-slate-200 to-slate-400 shadow-xl' : 'bg-transparent'}`}
                >
                  <div className={`glass-card p-8 h-full flex flex-col items-center text-center border-none ${selectedPlan === plan.id ? 'bg-white' : 'bg-white/40 opacity-80'}`}>
                    <div className={`w-12 h-12 ${plan.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20`}>
                      <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <h3 className="text-2xl font-black mb-1 text-slate-800">{plan.title}</h3>
                    <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-8">{plan.desc}</p>
                    <div className="mb-8">
                      <span className="text-5xl font-black text-slate-900">{plan.coverage}</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Coverage Factor</p>
                    </div>
                    <div className="space-y-3 mb-8 w-full">
                      {plan.perks.map(perk => (
                        <div key={perk} className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600">
                          <Check className="w-3.5 h-3.5 text-blue-500" />
                          {perk}
                        </div>
                      ))}
                    </div>
                    <div className="mt-auto pt-6 border-t border-slate-50 w-full flex items-center justify-center gap-2">
                      {selectedPlan === plan.id ? (
                        <div className="text-blue-500 font-black text-xs uppercase flex items-center gap-1">
                          <Check className="w-4 h-4" /> Selected
                        </div>
                      ) : (
                        <div className="text-slate-300 font-bold text-xs uppercase">Click to select</div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 flex justify-center">
              <button
                onClick={handleSelectPlan}
                disabled={loading}
                className="bg-slate-900 hover:bg-black text-white px-16 py-6 rounded-full font-black text-lg shadow-2xl transition-all flex items-center gap-4 active:scale-95"
              >
                {loading ? 'Calculating Premium...' : (
                  <>
                    Review Policy Contract
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        {step === 'policy-doc' && policyData && (
          <motion.div
            key="policy-doc"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-4xl z-10"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black premium-gradient-text mb-2">Policy Contract Generated</h2>
              <p className="text-slate-500 text-sm">Your digital protection for {formData.zone} is ready.</p>
            </div>

            <div className="bg-white rounded-[40px] shadow-2xl p-10 md:p-16 relative overflow-hidden text-slate-800 border border-slate-100">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-50 rounded-full blur-3xl opacity-50" />
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-green-50 rounded-full blur-3xl opacity-50" />

              <div className="flex justify-between items-start mb-16 relative z-10">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <ShieldCheck className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black tracking-tighter text-slate-900">DELIVERSURE</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Instant Parametric Shield</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-black text-slate-900">REF: QC-77{policyData.id}-DS</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">ISSUED ON: {new Date().toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-12 gap-y-10 mb-16 relative z-10">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Policy Holder</p>
                  <p className="text-xl font-bold text-slate-900">{formData.name}</p>
                  <p className="text-xs text-slate-500 font-medium capitalize">Quick Commerce Expert ({formData.work_type})</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Coverage Tier</p>
                  <p className="text-xl font-bold text-slate-900">{selectedPlan} Protection</p>
                  <p className="text-xs text-slate-500 font-medium">Auto-Trigger Settlements Enabled</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Validity Period</p>
                  <p className="text-xl font-bold text-slate-900">7 Days (Weekly)</p>
                  <p className="text-xs text-slate-500 font-medium">Auto-Renews: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Operating Zone</p>
                  <p className="text-xl font-bold text-slate-900 capitalize">{formData.zone}</p>
                  <p className="text-xs text-slate-500 font-medium">Parametric Coverage Active</p>
                </div>
              </div>

              <div className="bg-slate-50/80 backdrop-blur-sm rounded-[32px] p-8 mb-16 relative z-10 border border-slate-100 flex flex-wrap justify-between gap-6">
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Weekly Premium</p>
                  <p className="text-3xl font-black text-slate-900">₹{policyData.weekly_premium}</p>
                </div>
                <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Max Coverage</p>
                  <p className="text-3xl font-black text-blue-600">₹{policyData.coverage_amount}</p>
                </div>
                <div className="h-10 w-px bg-slate-200 hidden sm:block" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Trigger Mode</p>
                  <p className="text-sm font-black text-slate-800 uppercase mt-2">100% Zero-Touch</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10 border-t border-slate-100 pt-10">
                <div className="flex gap-6">
                  {/* ✅ PDF Download — fully functional */}
                  <button
                    onClick={handleDownloadPdf}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Save Local PDF
                  </button>
                  {/* ✅ View Terms — fully functional */}
                  <button
                    onClick={handleViewTerms}
                    className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400 hover:text-blue-500 transition-colors"
                  >
                    <FileText className="w-4 h-4" /> View Terms
                  </button>
                </div>
                <div className="text-center md:text-right">
                  <div className="flex items-center gap-2 text-slate-200 mb-2 justify-center md:justify-end">
                    <Check className="w-8 h-8 opacity-20" />
                    <Check className="w-8 h-8 opacity-20 -ml-6" />
                  </div>
                  <p className="text-[8px] font-black uppercase text-slate-300">Authorized Digital Signature: Node-11</p>
                </div>
              </div>
            </div>

            <div className="mt-12 flex justify-center">
              <button
                onClick={() => onComplete(riderId!)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-24 py-6 rounded-full font-black text-xl shadow-2xl shadow-blue-200 group flex items-center gap-4 active:scale-95 transition-all"
              >
                Launch Dashboard
                <ArrowRight className="w-7 h-7 group-hover:translate-x-3 transition-all" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
