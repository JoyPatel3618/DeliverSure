import React, { useState } from 'react';
import { CloudRain, Wind, AlertCircle, Play, RefreshCcw } from 'lucide-react';
import { simulateDisruption } from '../api/client';

interface SimulationProps {
  zone: string;
  onRefresh: () => void;
}

const SimulationConsole: React.FC<SimulationProps> = ({ zone, onRefresh }) => {
  const [pendingTrigger, setPendingTrigger] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (type: 'rain' | 'aqi' | 'traffic') => {
    if (pendingTrigger) return;
    setPendingTrigger(type);
    try {
      const data: any = {
        zone,
        rainfall: 0,
        aqi: 50,
        traffic_index: 1.0,
      };
      if (type === 'rain')    data.rainfall = 15.5;
      if (type === 'aqi')     data.aqi = 450;
      if (type === 'traffic') data.traffic_index = 3.5;

      await simulateDisruption(data);
      onRefresh();
      setTimeout(onRefresh, 3500);
    } catch (err) {
      console.error(err);
    } finally {
      setPendingTrigger(null);
    }
  };

  const resetSimulation = async () => {
    setLoading(true);
    try {
      await simulateDisruption({ zone, rainfall: 0, aqi: 50, traffic_index: 1.0 });
      setTimeout(onRefresh, 1000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-8 bg-white border-none shadow-2xl shadow-slate-950/[0.04]">
      <div className="flex justify-between items-center mb-10">
        <div>
           <h4 className="text-sm font-black text-slate-800 leading-none">Simulation Tab</h4>
           <div className="flex items-center gap-2 mt-1">
              <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Manual Trigger Control</p>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-[8px] font-black uppercase border border-blue-100">
                Unit: {zone}
              </span>
           </div>
        </div>
        <button
           onClick={resetSimulation}
           className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-blue-500 border border-slate-100 shadow-sm"
        >
          <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="space-y-4">
        {[
          { id: 'rain',    label: 'Heavy Rain Event',   icon: <CloudRain className="w-5 h-5 text-blue-500" />,    desc: '15.5mm/hr Flash Flood',      color: 'bg-blue-50'  },
          { id: 'aqi',     label: 'Toxic Air Quality',  icon: <Wind className="w-5 h-5 text-rose-500" />,         desc: 'AQI 450+ Visibility Alert',  color: 'bg-rose-50'  },
          { id: 'traffic', label: 'Congestion Jam',     icon: <AlertCircle className="w-5 h-5 text-amber-500" />, desc: '3.5x Traffic Multiplier',     color: 'bg-amber-50' },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => handleSimulate(item.id as any)}
            disabled={!!pendingTrigger}
            className={`w-full p-5 ${item.color} rounded-[28px] group transition-all transform active:scale-[0.98] flex items-center justify-between border-2 border-transparent hover:border-white shadow-sm shadow-current/5`}
          >
            <div className="flex items-center gap-5">
              <div className="p-3 bg-white rounded-2xl shadow-lg shadow-current/5 transition-transform group-hover:scale-110">
                {item.icon}
              </div>
              <div className="text-left">
                <p className="text-sm font-black text-slate-800 leading-none font-sans mb-1">{item.label}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">{item.desc}</p>
              </div>
            </div>
            <div className="p-2.5 bg-white rounded-full text-slate-300 group-hover:text-blue-500 transition-colors shadow-sm">
               {pendingTrigger === item.id ? (
                 <RefreshCcw className="w-4 h-4 animate-spin text-blue-500" />
               ) : (
                 <Play className="w-4 h-4 fill-current" />
               )}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-slate-50">
         <div className="flex items-center gap-4 text-[10px] text-slate-300 font-black uppercase tracking-widest leading-relaxed">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Live Deployment Mode
         </div>
      </div>
    </div>
  );
};

export default SimulationConsole;
