import React from 'react';
import { HelpCircle, ChevronRight, CheckCircle2, ShieldCheck, Search } from 'lucide-react';

const Walkthrough = ({ onClose }) => {
  const steps = [
    {
      title: "Select Verification Mode",
      desc: "Choose between File Upload, QR Scan, Hash Search, or Batch Check depending on the certificate format you have.",
      icon: <Search className="text-primary-500" />
    },
    {
      title: "Input Certificate Data",
      desc: "Upload the digital PDF, scan the physical QR code, or paste the 64-character SHA-256 fingerprint.",
      icon: <HelpCircle className="text-secondary-500" />
    },
    {
      title: "Query Blockchain Node",
      desc: "Our system instantly queries the TrustChain smart contract to verify if the certificate is authentic and not revoked.",
      icon: <ShieldCheck className="text-success" />
    },
    {
      title: "View Immutable Proof",
      desc: "Receive a detailed trust report with issuer details, registration timestamp, and a direct link to the blockchain audit trail.",
      icon: <CheckCircle2 className="text-primary-400" />
    }
  ];

  const demoData = [
    { type: "Success ID", value: "TC-DEMO-2026-001" },
    { type: "Revoked ID", value: "TC-DEMO-REVOKED-99" },
    { type: "Success Hash", value: "000000000000000000000000000000000000000000000000000000000000demo" }
  ];

  return (
    <div className="glass p-8 relative overflow-hidden animate-fadeIn">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h2 className="text-2xl font-bold italic">Verification Guide</h2>
          <p className="text-slate-400">Follow these simple steps to validate any credential.</p>
        </div>
        <div className="flex gap-4">
          <div className="hidden lg:flex gap-3 bg-white/5 p-3 rounded-2xl border border-white/5">
            {demoData.map((d, i) => (
              <div key={i} className="text-[0.6rem] px-2 py-1 bg-primary-500/10 rounded-md border border-primary-500/20">
                <span className="text-slate-500 font-bold uppercase">{d.type}:</span> <span className="font-mono text-primary-400">{d.value}</span>
              </div>
            ))}
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            Dismiss
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((step, index) => (
          <div key={index} className="relative group">
            <div className="bg-white/5 p-6 rounded-2xl border border-white/5 group-hover:border-primary-500/30 transition-all">
              <div className="bg-white/5 w-12 h-12 rounded-xl flex items-center justify-center mb-4">
                {step.icon}
              </div>
              <h3 className="text-lg font-bold mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="hidden lg:block absolute top-1/2 -right-4 -translate-y-1/2 text-slate-700">
                <ChevronRight size={24} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Walkthrough;
