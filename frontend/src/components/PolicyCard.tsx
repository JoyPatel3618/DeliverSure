import React from 'react';
import { ShieldCheck, Calendar, Zap, CreditCard, Award, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface PolicyCardProps {
  premium: number;
  coverage: number;
  isActive: boolean;
  planType?: string;
  createdAt: string;
}

const PolicyCard: React.FC<PolicyCardProps> = ({ premium, coverage, isActive, planType = 'Pro', createdAt }) => {
  const getPlanColor = () => {
    switch (planType) {
      case 'Starter': return 'bg-green-100 text-green-700 border-green-200';
      case 'Pro':     return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Elite':   return 'bg-purple-100 text-purple-700 border-purple-200';
      default:        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="glass-card p-10 bg-white border-none shadow-2xl shadow-blue-500/[0.05] relative overflow-hidden group"
    >
      <div className="absolute top-8 right-8 flex items-center gap-3">
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getPlanColor()} flex items-center gap-2 shadow-sm`}>
          <Zap className="w-3.5 h-3.5 fill-current" />
          {planType} Tier
        </div>
        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100'} border flex items-center gap-2`}>
          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {isActive ? 'Active Coverage' : 'Inactive'}
        </div>
      </div>

      <div className="flex items-center gap-6 mb-12">
        <div className="p-5 bg-blue-500 rounded-[32px] shadow-xl shadow-blue-200">
          <ShieldCheck className="w-9 h-9 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-800">Income Shield</h2>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">Parametric Flash Delivery Protection</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
        <div className="space-y-1">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Weekly Premium</p>
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-slate-300">₹</span>
            <span className="text-3xl font-black text-slate-900">{premium}</span>
          </div>
        </div>
        <div className="space-y-1">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Max Protection</p>
           <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-bold text-blue-300">₹</span>
            <span className="text-3xl font-black text-blue-600">{coverage}</span>
          </div>
        </div>
        <div className="hidden lg:block space-y-1">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Trigger Mechanism</p>
           <div className="flex items-center gap-2 mt-2">
              <Zap className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-bold text-slate-700">Digital Mesh</span>
           </div>
        </div>
        <div className="hidden lg:block space-y-1">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Verification</p>
           <div className="flex items-center gap-2 mt-2">
              <Award className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-bold text-slate-700">Instant</span>
           </div>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-50 flex flex-wrap justify-between items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-slate-50 rounded-xl">
             <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div>
             <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Contract Commencement</p>
             <p className="text-xs font-bold text-slate-600 uppercase">{new Date(createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-xl">
             <Clock className="w-4 h-4 text-blue-400" />
          </div>
          <div>
             <p className="text-[9px] font-black text-slate-300 uppercase leading-none mb-1">Next Renewal</p>
             <p className="text-xs font-bold text-slate-600 uppercase">
                {new Date(new Date(createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
             </p>
          </div>
        </div>

        <div className="flex gap-4">
           <button className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 hover:text-blue-600 transition-all group">
              View Policy Details
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1" />
           </button>
           <div className="w-px h-4 bg-slate-100" />
           <button className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-400 hover:text-emerald-600 transition-all group">
              <CreditCard className="w-3.5 h-3.5" />
              Premium Status
           </button>
        </div>
      </div>

      <div className="absolute top-0 left-0 w-2 h-full bg-blue-500" />
    </motion.div>
  );
};

export default PolicyCard;
