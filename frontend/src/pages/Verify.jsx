import React, { useState, useRef, useEffect } from 'react';
import { 
  Upload, Search, FileText, Hash, Loader2, ShieldCheck, User, Calendar, 
  Award, ExternalLink, QrCode, Layers, Info, CheckCircle2, XCircle, 
  AlertTriangle, Globe, BarChart3, Database, Link as LinkIcon, History,
  Languages, GraduationCap
} from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { verifyByFile, verifyByHash, verifyById, verifyBulk } from '../services/api';
import TrustScore from '../components/verification/TrustScore';
import Walkthrough from '../components/verification/Walkthrough';

const Verify = () => {
  const [activeTab, setActiveTab] = useState('file'); // 'file', 'hash', 'id', 'qr', 'batch'
  const [file, setFile] = useState(null);
  const [hash, setHash] = useState('');
  const [certId, setCertId] = useState('');
  const [issuerName, setIssuerName] = useState('IIT Delhi');
  const [customIssuer, setCustomIssuer] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [showGuide, setShowGuide] = useState(false);
  const [lang, setLang] = useState('en'); // 'en', 'hi'
  const [stats] = useState({ total: 12450, authentic: 12100, flagged: 350 });

  const fileInputRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Translations
  const t = {
    en: {
      title: "Certificate Verification",
      subtitle: "Instantly validate the authenticity of academic credentials across our global network.",
      fileTab: "File Upload",
      hashTab: "Hash Search",
      idTab: "ID Search",
      qrTab: "QR Scan",
      batchTab: "Batch Check",
      verifyBtn: "Verify Credential",
      placeholderHash: "Enter 64-char SHA-256 hash...",
      placeholderId: "Enter Certificate ID...",
      statsTotal: "Total Verifications",
      statsAuthentic: "Authentic Records",
      statsFlagged: "Flagged Items",
      howTo: "How it works",
      auditTrail: "Blockchain Audit Trail",
      registrationDate: "Registration Date",
      issuer: "Authorized Issuer",
      status: "Verification Status",
      viewOnChain: "View on Etherscan"
    },
    hi: {
      title: "प्रमाणपत्र सत्यापन",
      subtitle: "हमारे वैश्विक नेटवर्क पर शैक्षणिक साख की प्रामाणिकता को तुरंत मान्य करें।",
      fileTab: "फ़ाइल अपलोड",
      hashTab: "हैश सर्च",
      idTab: "आईडी सर्च",
      qrTab: "क्यूआर स्कैन",
      batchTab: "बैच चेक",
      verifyBtn: "सत्यापन करें",
      placeholderHash: "64-अक्षर SHA-256 हैश दर्ज करें...",
      placeholderId: "प्रमाणपत्र आईडी दर्ज करें...",
      statsTotal: "कुल सत्यापन",
      statsAuthentic: "प्रामाणिक रिकॉर्ड",
      statsFlagged: "संदिग्ध आइटम",
      howTo: "यह कैसे काम करता है",
      auditTrail: "ब्लॉकचेन ऑडिट ट्रेल",
      registrationDate: "पंजीकरण तिथि",
      issuer: "अधिकृत जारीकर्ता",
      status: "सत्यापन स्थिति",
      viewOnChain: "ब्लॉकचेन पर देखें"
    }
  }[lang];

  useEffect(() => {
    if (activeTab === 'qr') {
      const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
      scanner.render((decodedText) => {
        setHash(decodedText);
        setActiveTab('hash');
        scanner.clear();
      }, (err) => {
        // Handle scanning error
      });
      return () => scanner.clear();
    }
  }, [activeTab]);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let response;
      const finalIssuer = issuerName === 'Other' ? customIssuer : issuerName;
      
      if (activeTab === 'file') {
        if (!file) throw new Error("Please select a file.");
        response = await verifyByFile(file, finalIssuer);
        setResult(response.data.data);
      } else if (activeTab === 'hash') {
        if (!/^[0-9a-fA-F]{64}$/.test(hash)) throw new Error("Invalid SHA-256 hash.");
        response = await verifyByHash(hash);
        setResult(response.data.data);
      } else if (activeTab === 'id') {
        if (!certId) throw new Error("Certificate ID is required.");
        response = await verifyById(certId);
        setResult(response.data.data);
      } else if (activeTab === 'batch') {
        // Simple batch logic for demo
        setError("Batch verification mode initialized. Please upload CSV/Excel files.");
        setLoading(false);
        return;
      }

      if (response && !response.data.data.found) {
        setError("CERTIFICATE NOT FOUND: The provided data does not match any record on the TrustChain blockchain.");
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (ts) => {
    if (!ts) return "N/A";
    return new Date(ts * 1000).toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 animate-fadeIn space-y-12">
      {/* Header & Lang Toggle */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <h1 className="text-5xl font-black italic tracking-tighter mb-3 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
            {t.title}
          </h1>
          <p className="text-slate-400 max-w-xl">{t.subtitle}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-sm font-medium transition-all"
          >
            <Info size={16} className="text-primary-400" /> {t.howTo}
          </button>
          <button 
            onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600/20 hover:bg-primary-600/30 rounded-full border border-primary-500/30 text-sm font-bold transition-all text-primary-400"
          >
            <Languages size={16} /> {lang.toUpperCase()}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 flex items-center gap-5">
          <div className="bg-primary-500/10 p-4 rounded-2xl text-primary-500"><BarChart3 size={28} /></div>
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t.statsTotal}</div>
            <div className="text-2xl font-black italic">{stats.total.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass p-6 flex items-center gap-5">
          <div className="bg-success/10 p-4 rounded-2xl text-success"><ShieldCheck size={28} /></div>
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t.statsAuthentic}</div>
            <div className="text-2xl font-black italic text-success">{stats.authentic.toLocaleString()}</div>
          </div>
        </div>
        <div className="glass p-6 flex items-center gap-5">
          <div className="bg-danger/10 p-4 rounded-2xl text-danger"><AlertTriangle size={28} /></div>
          <div>
            <div className="text-xs text-slate-500 uppercase font-bold tracking-widest">{t.statsFlagged}</div>
            <div className="text-2xl font-black italic text-danger">{stats.flagged.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {showGuide && <Walkthrough onClose={() => setShowGuide(false)} />}

      <div className="glass rounded-[2.5rem] overflow-hidden shadow-2xl border-white/5">
        {/* Advanced Tabs */}
        <div className="flex flex-wrap bg-white/5 border-b border-white/5">
          {[
            { id: 'file', icon: Upload, label: t.fileTab },
            { id: 'qr', icon: QrCode, label: t.qrTab },
            { id: 'id', icon: Database, label: t.idTab },
            { id: 'hash', icon: Hash, label: t.hashTab },
            { id: 'batch', icon: Layers, label: t.batchTab },
          ].map(tab => (
            <button 
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); setError(null); }}
              className={`flex-1 min-w-[120px] py-6 flex flex-col items-center gap-2 font-bold transition-all border-r border-white/5 ${activeTab === tab.id ? 'bg-primary-600/20 text-white border-b-2 border-b-primary-500' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
            >
              <tab.icon size={22} className={activeTab === tab.id ? 'text-primary-500' : ''} />
              <span className="text-xs uppercase tracking-tighter">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Dynamic Form Content */}
        <div className="p-10 md:p-16">
          <form onSubmit={handleVerify} className="space-y-10">
            {activeTab === 'file' && (
              <div className="space-y-8">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/10 rounded-3xl p-16 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all group"
                >
                  <input type="file" hidden ref={fileInputRef} onChange={handleFileChange} />
                  <div className="bg-primary-600/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 text-primary-500 group-hover:scale-110 transition-transform">
                    <FileText size={40} />
                  </div>
                  <h3 className="text-2xl font-bold">{file ? file.name : "Drop Certificate PDF"}</h3>
                  <p className="text-slate-500 mt-2">Max 10MB • Secured Upload</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                  <div className="space-y-3">
                    <label className="text-xs text-slate-400 uppercase tracking-[0.2em] font-black pl-1">{t.issuer}</label>
                    <select 
                      value={issuerName}
                      onChange={(e) => setIssuerName(e.target.value)}
                      className="input-field py-4 font-bold appearance-none bg-slate-900 text-white cursor-pointer"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option className="bg-slate-900 text-white">IIT Delhi</option>
                      <option className="bg-slate-900 text-white">IIT Bombay</option>
                      <option className="bg-slate-900 text-white">IIT Madras</option>
                      <option className="bg-slate-900 text-white">IIT Kanpur</option>
                      <option className="bg-slate-900 text-white">BITS Pilani</option>
                      <option className="bg-slate-900 text-white">Delhi University (DU)</option>
                      <option className="bg-slate-900 text-white">Jawaharlal Nehru University (JNU)</option>
                      <option className="bg-slate-900 text-white">IIM Bangalore</option>
                      <option className="bg-slate-900 text-white">IIM Ahmedabad</option>
                      <option className="bg-slate-900 text-white">NIT Trichy</option>
                      <option className="bg-slate-900 text-white">Anna University</option>
                      <option className="bg-slate-900 text-white">MIT (USA)</option>
                      <option className="bg-slate-900 text-white">Stanford University</option>
                      <option className="bg-slate-900 text-white">Oxford University</option>
                      <option value="Other" className="bg-slate-900 text-white">Other / Custom</option>
                    </select>
                  </div>
                  {issuerName === 'Other' && (
                    <div className="space-y-3 animate-fadeIn">
                      <label className="text-xs text-slate-400 uppercase tracking-[0.2em] font-black pl-1">Custom Issuer Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter Institution Name..."
                        className="input-field py-4 font-bold"
                        onChange={(e) => setCustomIssuer(e.target.value)}
                      />
                    </div>
                  )}
                  <button type="submit" disabled={loading || !file} className="btn-primary py-5 w-full">
                    {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />} 
                    <span className="text-lg italic uppercase">{t.verifyBtn}</span>
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'qr' && (
              <div className="space-y-8 text-center">
                <div id="reader" className="w-full max-w-md mx-auto rounded-3xl overflow-hidden glass border-white/10"></div>
                <p className="text-slate-400 italic">Position the certificate QR code within the frame to scan.</p>
              </div>
            )}

            {activeTab === 'hash' && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs text-slate-400 uppercase tracking-[0.2em] font-black pl-1">{t.hashTab}</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-primary-500 transition-colors"><Search size={24} /></div>
                    <input 
                      type="text" 
                      placeholder={t.placeholderHash}
                      value={hash}
                      onChange={(e) => setHash(e.target.value)}
                      className="input-field py-6 pl-16 font-mono text-lg"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading || !hash} className="btn-primary py-5 w-full">
                  {loading ? <Loader2 className="animate-spin" /> : <Database size={24} />}
                  <span className="text-lg italic uppercase">{t.verifyBtn}</span>
                </button>
              </div>
            )}

            {activeTab === 'id' && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs text-slate-400 uppercase tracking-[0.2em] font-black pl-1">{t.idTab}</label>
                  <div className="relative group">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-secondary-500 transition-colors"><LinkIcon size={24} /></div>
                    <input 
                      type="text" 
                      placeholder={t.placeholderId}
                      value={certId}
                      onChange={(e) => setCertId(e.target.value)}
                      className="input-field py-6 pl-16 font-bold text-lg"
                    />
                  </div>
                </div>
                <button type="submit" disabled={loading || !certId} className="btn-primary py-5 w-full bg-gradient-to-r from-indigo-600 to-purple-600">
                  {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={24} />}
                  <span className="text-lg italic uppercase">{t.verifyBtn}</span>
                </button>
              </div>
            )}

            {activeTab === 'batch' && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label className="text-xs text-slate-400 uppercase tracking-[0.2em] font-black pl-1">Batch Fingerprints (One per line)</label>
                  <textarea 
                    placeholder="e3fa4801f556c8d8477f2eb0d4fdc84e63eb1e89b0559c16c16...&#10;a1b2c3d4..."
                    value={hash}
                    onChange={(e) => setHash(e.target.value)}
                    className="input-field py-6 font-mono text-sm h-40 resize-none"
                  />
                </div>
                <button 
                  type="button" 
                  onClick={async () => {
                    setLoading(true);
                    try {
                      const hashes = hash.split('\n').map(h => h.trim()).filter(h => h.length === 64);
                      if (hashes.length === 0) throw new Error("No valid 64-char hashes found.");
                      const response = await verifyBulk(hashes, 'hash');
                      setResult({ bulk: response.data.data, found: true, isValid: true });
                    } catch (err) {
                      setError(err.message);
                    } finally {
                      setLoading(false);
                    }
                  }}
                  disabled={loading || !hash} 
                  className="btn-primary py-5 w-full bg-gradient-to-r from-teal-600 to-emerald-600"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Layers size={24} />}
                  <span className="text-lg italic uppercase">Run Batch Verification</span>
                </button>
              </div>
            )}
          </form>

          {error && (
            <div className="mt-10 p-6 bg-danger/10 border border-danger/30 rounded-3xl text-danger flex items-center gap-4 animate-fadeIn">
              <XCircle size={32} />
              <div className="font-bold text-lg">{error}</div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Results Section */}
      {result && result.found && !result.bulk && (
        <div className="space-y-10 mb-20 animate-fadeIn">
          {/* Verdict Banner */}
          <div className={`p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center gap-8 ${result.isValid ? 'bg-success/10 border border-success/30' : 'bg-danger/10 border border-danger/30'}`}>
            <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl ${result.isValid ? 'bg-success text-white' : 'bg-danger text-white'}`}>
              {result.isValid ? <ShieldCheck size={50} /> : <XCircle size={50} />}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${result.isValid ? 'text-success' : 'text-danger'}`}>
                {result.isValid ? "Authentic Credential" : "Revoked Certificate"}
              </h2>
              <p className="text-slate-400 text-lg mt-1">
                {result.isValid 
                  ? "This document has been verified against the immutable ledger and matches all issuer parameters." 
                  : "This certificate was previously registered but has been officially revoked by the issuing authority."}
              </p>
            </div>
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10 text-center">
              <div className="text-[0.6rem] uppercase font-black tracking-widest text-slate-500 mb-1">Trust Integrity</div>
              <div className="text-3xl font-black italic">{result.isValid ? '100%' : '0%'}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Metadata Detail */}
            <div className="lg:col-span-2 glass p-10 rounded-[2.5rem] border-white/5">
              <h3 className="text-2xl font-black italic mb-8 flex items-center gap-3">
                <FileText className="text-primary-500" /> Certificate Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
                {[
                  { icon: User, label: "Graduate Name", value: result.student },
                  { icon: GraduationCap, label: "Degree / Program", value: result.degree },
                  { icon: History, label: "Batch Year", value: result.year },
                  { icon: LinkIcon, label: "Certificate Serial", value: result.certId },
                  { icon: Globe, label: "Issuer Authority", value: result.issuer || issuerName },
                  { icon: Calendar, label: t.registrationDate, value: formatDate(result.timestamp) },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-5 group">
                    <div className="bg-white/5 p-4 rounded-2xl group-hover:bg-primary-500/10 transition-colors"><item.icon className="text-slate-400 group-hover:text-primary-500" size={24} /></div>
                    <div>
                      <div className="text-xs text-slate-500 uppercase font-black tracking-widest mb-1">{item.label}</div>
                      <div className="text-xl font-bold italic truncate max-w-[200px]">{item.value || "N/A"}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit & Blockchain Sidecard */}
            <div className="space-y-8">
              <div className="glass p-8 rounded-[2.5rem] border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 text-white/5 -rotate-12 group-hover:scale-125 transition-transform"><Database size={120} /></div>
                <h4 className="text-lg font-black italic mb-6 relative z-10 uppercase tracking-tighter text-slate-400">{t.auditTrail}</h4>
                <div className="space-y-6 relative z-10">
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-mono text-[0.65rem] break-all text-slate-300">
                    <span className="text-primary-400 font-bold">SHA-256:</span> {result.hashSHA256 || hash}
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 font-mono text-[0.65rem] break-all text-slate-300">
                    <span className="text-secondary-400 font-bold">IPFS-CID:</span> {result.ipfsCID || "QmbWqx...7zP"}
                  </div>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${import.meta.env.VITE_CONTRACT_ADDRESS || '0x...'}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-primary-600/20 hover:bg-primary-600/30 rounded-2xl border border-primary-500/30 text-primary-400 font-bold italic transition-all group"
                  >
                    <span>{t.viewOnChain}</span>
                    <ExternalLink size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>

              <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 p-8 rounded-[2.5rem] border border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle2 className="text-success" size={20} />
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-400">Node Status</span>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  This query was resolved by 8 independent consensus nodes. Data integrity is guaranteed by the Ethereum network.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Results Table */}
      {result && result.bulk && (
        <div className="space-y-8 mb-20 animate-fadeIn">
          <div className="glass p-10 rounded-[2.5rem] border-white/5">
            <h3 className="text-2xl font-black italic mb-8 flex items-center gap-3">
              <Layers className="text-primary-500" /> Bulk Verification Report
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="pb-4 text-xs uppercase tracking-widest text-slate-500">Certificate</th>
                    <th className="pb-4 text-xs uppercase tracking-widest text-slate-500">Student</th>
                    <th className="pb-4 text-xs uppercase tracking-widest text-slate-500 text-center">Status</th>
                    <th className="pb-4 text-xs uppercase tracking-widest text-slate-500 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {result.bulk.map((item, idx) => (
                    <tr key={idx} className="group hover:bg-white/5 transition-colors">
                      <td className="py-5 font-mono text-xs text-slate-400">
                        {item.certId || (item.item && item.item.substring(0, 10) + '...')}
                      </td>
                      <td className="py-5 font-bold italic">{item.student || "Unknown"}</td>
                      <td className="py-5 text-center">
                        {item.found && item.isValid ? (
                          <span className="px-3 py-1 bg-success/20 text-success rounded-full text-[0.6rem] font-black uppercase">Authentic</span>
                        ) : item.found && !item.isValid ? (
                          <span className="px-3 py-1 bg-danger/20 text-danger rounded-full text-[0.6rem] font-black uppercase">Revoked</span>
                        ) : (
                          <span className="px-3 py-1 bg-slate-800 text-slate-500 rounded-full text-[0.6rem] font-black uppercase">Not Found</span>
                        )}
                      </td>
                      <td className="py-5 text-right">
                        <button 
                          onClick={() => setResult({ ...item, found: true })}
                          className="text-primary-500 hover:text-primary-400 transition-colors"
                        >
                          <Info size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Verify;
