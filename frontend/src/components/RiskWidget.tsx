import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Activity, MapPin, Info } from 'lucide-react';

interface RiskWidgetProps {
  riskScore: number;
  zone: string;
}

const RiskWidget: React.FC<RiskWidgetProps> = ({ riskScore, zone }) => {
  const data = [
    { name: 'Risk',   value: riskScore * 100 },
    { name: 'Safety', value: (1 - riskScore) * 100 },
  ];

  const getRiskLabel = (score: number) => {
    if (score < 0.3) return { text: 'Optimal',  color: 'text-emerald-500', bg: 'bg-emerald-50' };
    if (score < 0.6) return { text: 'Elevated', color: 'text-amber-500',   bg: 'bg-amber-50'   };
    return               { text: 'Extreme',  color: 'text-rose-500',    bg: 'bg-rose-50'    };
  };

  const currentRisk = getRiskLabel(riskScore);

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="glass-card p-8 bg-white border-none shadow-2xl shadow-slate-950/[0.03] flex flex-col items-center text-center relative overflow-hidden"
    >
      <div className="w-full flex justify-between items-center mb-10">
         <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-xl">
               <MapPin className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{zone}</span>
         </div>
         <div className="p-2 bg-slate-50 rounded-xl cursor-help">
            <Info className="w-4 h-4 text-slate-300" />
         </div>
      </div>

      <div className="relative w-48 h-48 mb-8">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              innerRadius={65}
              outerRadius={85}
              startAngle={225}
              endAngle={-45}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
              cornerRadius={40}
            >
              <Cell key="cell-0" fill={riskScore > 0.6 ? '#f43f5e' : riskScore > 0.3 ? '#f59e0b' : '#10b981'} />
              <Cell key="cell-1" fill="#f1f5f9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center -mt-2">
           <span className="text-4xl font-black text-slate-900 leading-none">{(riskScore * 100).toFixed(0)}%</span>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Local Risk</span>
        </div>
      </div>

      <div className="w-full space-y-4">
         <div className={`py-4 px-6 rounded-3xl ${currentRisk.bg} ${currentRisk.color} border border-transparent shadow-sm shadow-current/5`}>
           <div className="flex items-center justify-center gap-2">
              <Activity className="w-4 h-4 animate-pulse" />
              <span className="text-sm font-black uppercase tracking-widest">{currentRisk.text} Risk Profile</span>
           </div>
         </div>
         <p className="text-[11px] text-slate-400 font-medium leading-relaxed px-2">
            System actively scanning for flash floods, air quality spikes, and logistics congestion.
         </p>
      </div>

      <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50" />
    </motion.div>
  );
};

export default RiskWidget;
