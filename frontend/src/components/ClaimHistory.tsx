import React from 'react';
import { motion } from 'framer-motion';
import { Check, Clock, AlertCircle, TrendingUp, History } from 'lucide-react';
import { type Claim } from '../api/client';

interface ClaimHistoryProps {
  claims: Claim[];
}

const ClaimHistory: React.FC<ClaimHistoryProps> = ({ claims }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'triggered':  return 'bg-amber-100 text-amber-600 border-amber-200';
      case 'processing': return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'approved':   return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'paid':       return 'bg-indigo-100 text-indigo-600 border-indigo-200';
      default:           return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'triggered':  return <AlertCircle className="w-3.5 h-3.5" />;
      case 'processing': return <Clock className="w-3.5 h-3.5 animate-spin" />;
      case 'approved':
      case 'paid':       return <Check className="w-3.5 h-3.5" />;
      default:           return null;
    }
  };

  return (
    <div className="glass-card p-10 bg-white border-none shadow-2xl shadow-slate-950/[0.04] relative">
      <div className="flex justify-between items-center mb-10">
        <div className="flex items-center gap-4">
           <div className="p-3 bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-slate-200">
              <History className="w-6 h-6 text-white" />
           </div>
           <div>
              <h3 className="text-2xl font-black tracking-tight text-slate-800 leading-none">Smart Settlements</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Autonomous Claim History</p>
           </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
           <TrendingUp className="w-4 h-4 text-blue-500" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Self-Healing Grid</span>
        </div>
      </div>

      <div className="space-y-4">
        {claims.length === 0 ? (
          <div className="py-20 text-center space-y-3 bg-slate-50 rounded-[40px] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-white rounded-full mx-auto flex items-center justify-center shadow-sm">
               <History className="w-8 h-8 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-sm tracking-tight">No active disruptions detected. You're clear!</p>
          </div>
        ) : (
          claims.map((claim, idx) => (
            <motion.div
              key={claim.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="group p-5 bg-slate-50 hover:bg-white rounded-[28px] border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-wrap items-center justify-between gap-6"
            >
              <div className="flex items-center gap-5">
                <div className={`p-4 rounded-2xl ${getStatusColor(claim.status)} border transition-transform group-hover:scale-105`}>
                   {getStatusIcon(claim.status) || <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-800 leading-none mb-1">{claim.trigger_event}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{new Date(claim.timestamp).toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Settlement</p>
                  <p className="text-lg font-black text-slate-800">₹{claim.payout_amount.toFixed(2)}</p>
                </div>
                <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.15em] border ${getStatusColor(claim.status)} shadow-sm min-w-[120px] text-center`}>
                  {claim.status}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div className="mt-8 flex justify-center opacity-30">
         <div className="w-1 h-8 bg-slate-200 rounded-full flex items-start justify-center p-0.5">
            <motion.div animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" />
         </div>
      </div>
    </div>
  );
};

export default ClaimHistory;
