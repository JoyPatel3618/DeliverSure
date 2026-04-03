import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPolicy, getClaims, getRiskScore, type Policy, type Claim } from '../api/client';
import RiskWidget from '../components/RiskWidget';
import PolicyCard from '../components/PolicyCard';
import ClaimHistory from '../components/ClaimHistory';
import SimulationConsole from '../components/SimulationConsole';
import { LogOut, RefreshCcw, Bell, Shield, Check, FlaskConical, X, Lock } from 'lucide-react';

interface DashboardProps {
  riderId: number;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ riderId, onLogout }) => {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [riskScore, setRiskScore] = useState(0.3);
  const [loading, setLoading] = useState(true);

  // Tester mode: persisted across page refreshes
  const [testerMode, setTesterMode] = useState<boolean>(() => {
    return localStorage.getItem('deliverSure_testerMode') === 'true';
  });

  const toggleTesterMode = () => {
    setTesterMode(prev => {
      const next = !prev;
      localStorage.setItem('deliverSure_testerMode', String(next));
      return next;
    });
  };

  const fetchData = async () => {
    try {
      const polRes = await getPolicy(riderId);
      const claimRes = await getClaims(riderId);
      setPolicy(polRes.data);
      setClaims(claimRes.data);
      const riskRes = await getRiskScore(polRes.data.zone || 'south mumbai');
      setRiskScore(riskRes.data.risk_score);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [riderId]);

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 text-blue-500">
      <motion.div
        animate={{ scale: [1, 1.1, 1], rotate: 360 }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className="w-16 h-16 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-8 border border-slate-100"
      >
        <Shield className="w-8 h-8" />
      </motion.div>
      <div className="flex flex-col items-center gap-2">
        <span className="font-black tracking-[0.2em] text-[10px] uppercase text-slate-400">Syncing Node</span>
        <div className="h-1 w-48 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            animate={{ x: [-200, 200] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="h-full w-24 bg-blue-500"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20 bg-[#fcfcfd] text-slate-900">

      {/* ── Navbar ── */}
      <nav className="p-4 md:p-6 mb-8 flex justify-between items-center border-b border-white/50 bg-white/70 backdrop-blur-3xl sticky top-0 z-50 shadow-sm shadow-slate-100/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center font-black text-white shadow-lg shadow-blue-200">D</div>
          <div>
            <h1 className="text-lg font-black tracking-tighter leading-none">DeliverSure</h1>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Quick Commerce Node</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={fetchData} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900 border border-slate-100">
            <RefreshCcw className="w-5 h-5" />
          </button>
          <button className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all text-slate-400 hover:text-slate-900 border border-slate-100 relative">
            <Bell className="w-5 h-5" />
            <div className="absolute top-2 right-2 w-2 h-2 bg-red-400 rounded-full border-2 border-white" />
          </button>

          {/* ── Tester Mode Toggle ── */}
          <button
            onClick={toggleTesterMode}
            title={testerMode ? 'Disable Tester Mode' : 'Enable Tester Mode'}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${
              testerMode
                ? 'bg-amber-50 border-amber-200 text-amber-600 hover:bg-amber-100 shadow-sm'
                : 'bg-slate-50 border-slate-100 text-slate-400 hover:bg-slate-100'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span className="hidden sm:inline">{testerMode ? 'Tester On' : 'Tester'}</span>
          </button>

          <div className="w-px h-6 bg-slate-100 mx-1" />
          <button onClick={onLogout} className="p-2.5 bg-red-50 hover:bg-red-100 rounded-xl transition-all text-red-300 hover:text-red-500 border border-red-50">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </nav>

      {/* ── Tester Mode Banner ── */}
      <AnimatePresence>
        {testerMode && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
            className="max-w-7xl mx-auto px-6 mb-6"
          >
            <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-3xl px-6 py-4">
              <div className="shrink-0 mt-0.5 p-2 bg-amber-100 rounded-xl">
                <FlaskConical className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-black text-amber-800 leading-none mb-1">Tester Mode Active</p>
                <p className="text-[11px] text-amber-600 font-medium leading-relaxed">
                  The <span className="font-bold">Simulation Tab</span> and <span className="font-bold">Automation Pipeline</span> are visible below for testing and demo purposes only.
                  These controls allow manual event injection to showcase the parametric trigger engine.
                  <span className="font-bold"> They will be removed in the production release.</span>
                </p>
              </div>
              <button
                onClick={toggleTesterMode}
                className="shrink-0 p-1.5 rounded-lg text-amber-400 hover:text-amber-600 hover:bg-amber-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Grid ── */}
      <main className={`max-w-7xl mx-auto px-6 grid gap-8 ${testerMode ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>

        {/* Left Column: Stats & Policy (always visible) */}
        <div className={testerMode ? 'lg:col-span-8 space-y-8' : 'space-y-8'}>
          <div className={`grid grid-cols-1 gap-6 ${testerMode ? 'md:grid-cols-2' : 'md:grid-cols-2 xl:grid-cols-3'}`}>
           <RiskWidget riskScore={riskScore} zone={policy?.zone || 'Active Zone'} />

            <motion.div
              whileHover={{ y: -5 }}
              className="glass-card p-8 bg-white/40 border-none shadow-xl shadow-blue-500/[0.03] flex flex-col justify-between"
            >
              <div>
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Payouts Resolved</p>
                <div className="flex items-baseline gap-3">
                  <h2 className="text-5xl font-black text-slate-900 leading-tight">
                    ₹{claims
                      .filter(c => ['paid', 'approved', 'processing', 'triggered'].includes(c.status))
                      .reduce((a, b) => a + b.payout_amount, 0)
                      .toFixed(2)}
                  </h2>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Check className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-[11px] text-slate-500 font-medium leading-tight">
                  System successfully settled <span className="font-bold text-slate-900">{claims.length}</span> instances of delivery disruption for you.
                </p>
              </div>
            </motion.div>

            {/* Third stat card — only shows in tester-off 3-col layout */}
            {!testerMode && policy && (
              <motion.div
                whileHover={{ y: -5 }}
                className="glass-card p-8 bg-white/40 border-none shadow-xl shadow-blue-500/[0.03] flex flex-col justify-between hidden xl:flex"
              >
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Active Plan</p>
                  <h2 className="text-5xl font-black text-slate-900 leading-tight capitalize">{policy.plan_type}</h2>
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-2">Protection Tier</p>
                </div>
                <div className="mt-8 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Zone</span>
                    <span className="text-xs font-black text-slate-700 capitalize">{policy.zone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Renews</span>
                    <span className="text-xs font-black text-slate-700">
                      {new Date(new Date(policy.created_at).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${policy.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                      {policy.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {policy && (
              <PolicyCard
                premium={policy.weekly_premium}
                coverage={policy.coverage_amount}
                isActive={policy.is_active}
                planType={policy.plan_type}
                createdAt={policy.created_at}
              />
            )}
          </motion.div>

          <ClaimHistory claims={claims} />
        </div>

        {/* Right Column: Simulation Tab + Automation Pipeline — TESTER MODE ONLY */}
        <AnimatePresence>
          {testerMode && (
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.3 }}
              className="lg:col-span-4 space-y-6"
            >
              {policy ? (
                <SimulationConsole zone={policy.zone} onRefresh={fetchData} />
              ) : (
                <div className="glass-card p-8 bg-white border-none shadow-xl shadow-slate-950/[0.02] flex items-center justify-center min-h-[300px]">
                  <div className="text-center">
                    <RefreshCcw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Local Node...</p>
                  </div>
                </div>
              )}

              <div className="glass-card p-8 bg-white border-none shadow-xl shadow-slate-950/[0.02]">
                <h4 className="text-[10px] text-slate-300 font-black uppercase tracking-widest mb-6">Automation Pipeline</h4>
                <ul className="space-y-6">
                  {[
                    { step: 1, title: 'Monitor', text: 'Real-time sync with local Dark Store weather nodes.', color: 'bg-blue-100 text-blue-600' },
                    { step: 2, title: 'Trigger', text: 'Auto-detection of rainfall or high traffic density.', color: 'bg-orange-100 text-orange-600' },
                    { step: 3, title: 'Payout', text: 'Funds dispatched to linked UPI wallet in seconds.', color: 'bg-green-100 text-green-600' },
                  ].map(item => (
                    <li key={item.step} className="flex gap-4">
                      <div className={`shrink-0 w-8 h-8 ${item.color} rounded-xl flex items-center justify-center font-black text-xs`}>
                        0{item.step}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-slate-800 leading-none mb-1">{item.title}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Locked placeholder shown when tester mode is OFF */}
        {!testerMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-2"
          >
            <button
              onClick={toggleTesterMode}
              className="flex items-center gap-3 px-5 py-3 bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-600 transition-all text-[11px] font-bold uppercase tracking-widest group"
            >
              <Lock className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
              Enable Tester Mode to access Simulation Controls
              <FlaskConical className="w-4 h-4 group-hover:text-amber-500 transition-colors" />
            </button>
          </motion.div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;
