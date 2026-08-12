import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserPlus, Trash2, Loader2, Globe, CheckCircle, XCircle } from 'lucide-react';
import { getIssuers, authorizeIssuer, revokeIssuer } from '../services/api';

const AdminPanel = () => {
  const [issuers, setIssuers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    walletAddress: ''
  });

  useEffect(() => {
    fetchIssuers();
  }, []);

  const fetchIssuers = async () => {
    try {
      const res = await getIssuers();
      setIssuers(res.data.data);
    } catch (err) {
      console.log("Using mock issuers");
      setIssuers([
        { name: 'IIT Delhi', walletAddress: '0x633516609930C8CEF078652D087708573Af98f82', status: 'authorized' },
        { name: 'IIT Bombay', walletAddress: '0x89Ac3460C32d4F99A9876e0fD98E31B6cEb6843A', status: 'authorized' },
        { name: 'BITS Pilani', walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', status: 'authorized' },
        { name: 'NIT Trichy',  walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', status: 'authorized' },
        { name: 'IIM Ahmedabad', walletAddress: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', status: 'authorized' },
        { name: 'Delhi University', walletAddress: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', status: 'authorized' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorize = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await authorizeIssuer(formData);
      setShowAddForm(false);
      setFormData({ name: '', walletAddress: '' });
      fetchIssuers();
    } catch (err) {
      alert("Authorization failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (address) => {
    if (!window.confirm("Are you sure you want to revoke this issuer?")) return;
    try {
      await revokeIssuer(address);
      fetchIssuers();
    } catch (err) {
      alert("Revocation failed.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 animate-fadeIn pb-20">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3 italic">
            <Globe className="text-primary-500" /> Network Administration
          </h1>
          <p className="text-slate-400">Manage institutional permissions and network authority.</p>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary flex items-center gap-2"
        >
          <UserPlus size={20} /> Authorize New Issuer
        </button>
      </div>

      {showAddForm && (
        <div className="glass rounded-3xl p-8 mb-12 border-primary-500/30 animate-slideUp">
          <h2 className="text-xl font-bold mb-6 italic">Enroll Institutional Partner</h2>
          <form onSubmit={handleAuthorize} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-500 ml-1">Institution Name</label>
              <input 
                type="text" 
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. IIT Madras"
                className="input-field"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-500 ml-1">Ethereum Wallet Address</label>
              <input 
                type="text" 
                required
                value={formData.walletAddress}
                onChange={(e) => setFormData({...formData, walletAddress: e.target.value})}
                placeholder="0x..."
                className="input-field font-mono"
              />
            </div>
            <button type="submit" disabled={isSubmitting} className="btn-primary py-3.5 flex items-center justify-center gap-2 tracking-wide">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Confirm Authorization
            </button>
          </form>
        </div>
      )}

      <div className="glass rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 bg-white/5 border-b border-white/5 flex items-center justify-between">
          <h3 className="font-bold opacity-80 uppercase tracking-widest text-sm italic">Authorized Issuers Registry</h3>
          <span className="text-xs text-slate-500">{issuers.length} nodes active</span>
        </div>
        
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary-500" size={48} /></div>
        ) : (
          <div className="divide-y divide-white/5">
            {issuers.map((issuer, i) => (
              <div key={i} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:bg-white/5 transition-all group">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-2xl bg-primary-600/10 flex items-center justify-center text-primary-500 group-hover:scale-110 group-hover:bg-primary-600 group-hover:text-white transition-all">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <div className="text-xl font-bold group-hover:text-primary-400 transition-colors uppercase italic tracking-tight">{issuer.name}</div>
                    <div className="text-xs font-mono text-slate-500 mt-1">{issuer.walletAddress}</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-success font-bold text-sm bg-success/10 px-3 py-1.5 rounded-full border border-success/20">
                    <CheckCircle size={14} /> Active
                  </div>
                  <button 
                    onClick={() => handleRevoke(issuer.walletAddress)}
                    className="p-3 text-danger hover:bg-danger/10 rounded-xl transition-all"
                    title="Revoke Issuer"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
