import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Cpu, Award } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const TrustScore = ({ score, verdict, breakdown, recommendation }) => {
  const getColor = (s) => {
    if (s >= 80) return '#22c55e'; // success
    if (s >= 60) return '#eab308'; // warning
    return '#ef4444'; // danger
  };

  const getIcon = (v) => {
    switch(v) {
      case 'REAL': return <CheckCircle2 className="text-success" size={48} />;
      case 'SUSPICIOUS': return <AlertTriangle className="text-yellow-500" size={48} />;
      case 'FAKE': return <XCircle className="text-danger" size={48} />;
      default: return <ShieldCheck className="text-primary-500" size={48} />;
    }
  };

  const chartData = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  return (
    <div className="glass p-8 rounded-2xl animate-slideUp">
      <div className="flex flex-col md:flex-row gap-8 items-center">
        {/* Score Ring */}
        <div className="relative w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={0}
                dataKey="value"
                startAngle={90}
                endAngle={450}
              >
                <Cell fill={getColor(score)} />
                <Cell fill="rgba(255,255,255,0.05)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold" style={{ color: getColor(score) }}>{score}%</span>
            <span className="text-xs uppercase tracking-widest text-slate-500">Trust Score</span>
          </div>
        </div>

        {/* Verdict & Details */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-4">
            {getIcon(verdict)}
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Verdict: <span style={{ color: getColor(score) }}>{verdict}</span></h2>
              <p className="text-slate-400 text-sm leading-relaxed">{recommendation}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck size={16} className="text-primary-500" />
                <span className="text-xs text-slate-400 uppercase font-semibold">Blockchain</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-primary-500 h-full transition-all duration-1000" 
                  style={{ width: `${breakdown?.blockchain?.score || 0}%` }}
                />
              </div>
              <p className="text-right text-xs mt-1 font-mono">{breakdown?.blockchain?.score || 0}%</p>
            </div>

            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Cpu size={16} className="text-purple-500" />
                <span className="text-xs text-slate-400 uppercase font-semibold">AI Analysis</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-purple-500 h-full transition-all duration-1000" 
                  style={{ width: `${breakdown?.ai?.score || 0}%` }}
                />
              </div>
              <p className="text-right text-xs mt-1 font-mono">{breakdown?.ai?.score || 0}%</p>
            </div>

            <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Award size={16} className="text-success" />
                <span className="text-xs text-slate-400 uppercase font-semibold">Issuer DB</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-success h-full transition-all duration-1000" 
                  style={{ width: `${breakdown?.issuer?.score || 0}%` }}
                />
              </div>
              <p className="text-right text-xs mt-1 font-mono">{breakdown?.issuer?.score || 0}%</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustScore;
