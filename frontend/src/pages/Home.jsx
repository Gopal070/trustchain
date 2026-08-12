import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Award, Globe, Database, ArrowRight, CheckCircle, Search, FileCheck } from 'lucide-react';

const Home = () => {
  const stats = [
    { label: 'Verified Certificates', value: '1.2M+', icon: CheckCircle },
    { label: 'Trusted Issuers', value: '450+', icon: Award },
    { label: 'Network Points', value: '25', icon: Globe },
    { label: 'Average Score', value: '98%', icon: ShieldCheck },
  ];

  const features = [
    {
      title: 'Blockchain Immutability',
      description: 'Records are anchored to the Ethereum Sepolia testnet, ensuring they can never be altered or forged.',
      icon: Database,
    },
    {
      title: 'AI Forensic Analysis',
      description: 'Advanced vision models detect pixel-level manipulations, font inconsistencies, and layout tempering.',
      icon: Search,
    },
    {
      title: 'Global Accessibility',
      description: 'Verify from anywhere in the world with instant results and a multi-factor trust report.',
      icon: Globe,
    },
    {
      title: 'Direct Issuer Verification',
      description: 'Authenticity is cross-referenced with authorized institutional databases in real-time.',
      icon: FileCheck,
    },
  ];

  return (
    <div className="animate-fadeIn">
      {/* Hero Section */}
      <section className="py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-purple-500">
          Verify with Absolute Certainty.
        </h1>
        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
          The world's first multi-factor certificate verification engine combining the power of Blockchain, AI, and Institutional Intelligence.
        </p>
        <div className="flex flex-col md:flex-row gap-4 justify-center">
          <Link to="/verify" className="btn-primary py-4 px-10 text-lg flex items-center justify-center gap-2 group">
            Verify Certificate <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login" className="glass py-4 px-10 rounded-lg text-lg font-semibold hover:bg-white/10 transition-all border border-white/20">
            For Institutions
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 text-center rounded-2xl animate-slideUp" style={{ animationDelay: `${i * 100}ms` }}>
            <stat.icon className="mx-auto text-primary-500 mb-3" size={28} />
            <div className="text-3xl font-bold">{stat.value}</div>
            <div className="text-xs text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4 italic">Next-Generation Security</h2>
          <div className="h-1 w-20 bg-primary-500 mx-auto rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, i) => (
            <div key={i} className="glass p-8 rounded-3xl group hover:border-primary-500/50 transition-all">
              <div className="w-14 h-14 bg-primary-600/20 rounded-2xl flex items-center justify-center mb-6 text-primary-500 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all">
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Proof Section (Graphic Placeholder/CTA) */}
      <section className="glass rounded-[2rem] p-12 text-center relative overflow-hidden mb-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/10 blur-[100px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full"></div>
        
        <h2 className="text-3xl font-bold mb-6">Ready to anchor your credentials?</h2>
        <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
          Join hundreds of elite universities and certification bodies securing their reputation on the TrustChain network.
        </p>
        <button className="btn-primary py-3 px-8">Contact Our Integration Team</button>
      </section>
    </div>
  );
};

export default Home;
