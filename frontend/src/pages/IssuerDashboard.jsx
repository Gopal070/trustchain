import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, ShieldCheck, History, AlertCircle, 
  ExternalLink, Loader2, X, Upload, FileText, CheckCircle 
} from 'lucide-react';
import { getIssuerCertificates, registerCertificate } from '../services/api';

const IssuerDashboard = () => {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    certId: `CERT-${Math.floor(Math.random() * 900000 + 100000)}`,
    studentName: '',
    degree: '',
    year: '2026',
    fileHash: ''
  });

  const stats = [
    { label: 'Total Anchored', value: '1,284', icon: ShieldCheck, color: 'text-primary-500' },
    { label: 'Active Status', value: '1,272', icon: CheckCircle, color: 'text-success' },
    { label: 'Revoked', value: '12', icon: AlertCircle, color: 'text-danger' },
    { label: 'Live Network', value: 'Sepolia', icon: History, color: 'text-purple-500' },
  ];

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    try {
      // For demo, if API fails, use mock
      const res = await getIssuerCertificates();
      setCerts(res.data.data);
    } catch (err) {
      console.log("Using mock data as API is unavailable");
      setCerts([
        { id: 'CERT-313006', name: 'John Doe',       degree: 'B.Tech Computer Science',        status: 'active',   date: '2026-03-24', tx: '0xabc1...' },
        { id: 'CERT-445892', name: 'Alice Smith',    degree: 'M.Tech Artificial Intelligence', status: 'active',   date: '2026-03-22', tx: '0xdef2...' },
        { id: 'CERT-887722', name: 'Suresh Raina',   degree: 'B.E. Electronics & Comm.',       status: 'active',   date: '2026-03-20', tx: '0xghi3...' },
        { id: 'CERT-991100', name: 'Karan Mehta',    degree: 'B.Com (Hons.)',                  status: 'revoked',  date: '2026-03-18', tx: '0xjkl4...' },
        { id: 'CERT-112003', name: 'Bob Wilson',     degree: 'M.Sc. Cyber Security',           status: 'active',   date: '2026-02-15', tx: '0xmno5...' },
        { id: 'CERT-554201', name: 'Priya Patel',    degree: 'M.Tech Data Science',            status: 'active',   date: '2026-02-10', tx: '0xpqr6...' },
        { id: 'CERT-667834', name: 'Rohan Gupta',    degree: 'B.Tech Mechanical',              status: 'active',   date: '2026-01-30', tx: '0xstu7...' },
        { id: 'CERT-778923', name: 'Anjali Sharma',  degree: 'MBA (Finance)',                  status: 'revoked',  date: '2026-01-14', tx: '0xvwx8...' },
        { id: 'CERT-889011', name: 'Dev Anand',      degree: 'B.Tech Civil Engineering',       status: 'active',   date: '2025-12-20', tx: '0xyz9...'  },
        { id: 'CERT-990122', name: 'Neha Joshi',     degree: 'B.Sc. Physics',                  status: 'active',   date: '2025-11-05', tx: '0xaaa0...' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await registerCertificate(formData);
      setIsModalOpen(false);
      fetchCerts();
      // Reset form
      setFormData({
        certId: `CERT-${Math.floor(Math.random() * 900000 + 100000)}`,
        studentName: '',
        degree: '',
        year: '2026',
        fileHash: ''
      });
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.error || err.message || "Registration failed";
      alert(`Registration failed: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCerts = certs.filter(c => 
    (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterStatus === 'all' || c.status === filterStatus)
  );

  return (
    <div className="px-6 animate-fadeIn pb-20">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="glass rounded-[2rem] p-8">
        {/* Table Header Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-10">
          <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <h2 className="text-2xl font-bold italic mr-4">Institution Records</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field py-2 pl-10 text-sm md:w-64"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <select 
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input-field py-2 pl-10 pr-8 text-sm md:w-40 appearance-none"
              >
                <option value="all">All Records</option>
                <option value="active">Active</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center gap-2 whitespace-nowrap">
            <Plus size={20} /> Anchor New Certificate
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-primary-500" size={48} /></div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-white/5">
            <table className="w-full text-left">
              <thead className="bg-white/5 text-xs text-slate-500 font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Certificate ID</th>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Degree / Award</th>
                  <th className="px-6 py-4 text-center">Status</th>
                  <th className="px-6 py-4">Issue Date</th>
                  <th className="px-6 py-4 text-center">Tx Network</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCerts.map((cert) => (
                  <tr key={cert.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono text-sm">{cert.id}</td>
                    <td className="px-6 py-4 font-semibold">{cert.name}</td>
                    <td className="px-6 py-4 text-sm text-slate-400">{cert.degree}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`badge ${cert.status === 'active' ? 'bg-success/10 text-success border border-success/20' : 'bg-danger/10 text-danger border border-danger/20'}`}>
                        {cert.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">{cert.date}</td>
                    <td className="px-6 py-4 text-center">
                      <a href="#" className="text-primary-500 hover:text-white transition-colors flex items-center justify-center gap-1 group-hover:scale-110">
                        <ShieldCheck size={16} /> <ExternalLink size={12} />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Registration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 animate-fadeIn">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          <div className="glass w-full max-w-2xl rounded-3xl p-10 relative z-10 animate-slideUp">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white"><X /></button>
            <h2 className="text-3xl font-bold mb-2">Issue New Certificate</h2>
            <p className="text-slate-400 mb-8">Anchor a digital record permanently to the blockchain network.</p>

            <form onSubmit={handleRegister} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-slate-500 ml-1">Certificate ID (Auto)</label>
                  <input type="text" readOnly value={formData.certId} className="input-field opacity-60 cursor-not-allowed bg-slate-950" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs uppercase font-bold text-slate-500 ml-1">Issue Year</label>
                  <select 
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="input-field"
                  >
                    <option>2024</option><option>2025</option><option>2026</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-slate-500 ml-1">Student Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Johnathan Doe"
                  value={formData.studentName}
                  onChange={(e) => setFormData({...formData, studentName: e.target.value})}
                  className="input-field" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-slate-500 ml-1">Degree Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. B.S. in Computer Science"
                  value={formData.degree}
                  onChange={(e) => setFormData({...formData, degree: e.target.value})}
                  className="input-field" 
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs uppercase font-bold text-slate-500 ml-1">Upload Certificate File</label>
                <div 
                  className="border-2 border-dashed border-white/10 rounded-2xl p-6 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-500/5 transition-all group"
                  onClick={() => document.getElementById('certFile').click()}
                >
                  <input 
                    type="file" 
                    id="certFile" 
                    hidden 
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const buffer = await file.arrayBuffer();
                        const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
                        const hashArray = Array.from(new Uint8Array(hashBuffer));
                        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                        setFormData({...formData, fileHash: hashHex});
                      }
                    }} 
                  />
                  <Upload className="mx-auto mb-2 text-slate-500 group-hover:text-primary-500 transition-colors" size={32} />
                  <p className="text-sm font-semibold">{formData.fileHash ? "File Selected & Hashed" : "Select PDF or Image"}</p>
                  <p className="text-[0.6rem] text-slate-500 font-mono mt-1 truncate">{formData.fileHash || "SHA-256 will be calculated automatically"}</p>
                </div>
              </div>

              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3">
                  {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />} Anchor to Ethereum Sepolia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssuerDashboard;
