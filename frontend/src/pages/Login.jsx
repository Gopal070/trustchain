import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, Loader2, ShieldCheck } from 'lucide-react';
import { login as loginApi } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const isAdmin = email === 'admin@trustchain.com';
      
      const mockResult = {
        token: 'demo-token',
        user: {
          id: 'u1',
          name: isAdmin ? 'Network Admin' : 'IIT Delhi Issuer',
          email,
          role: isAdmin ? 'admin' : 'issuer'
        }
      };

      localStorage.setItem('token', mockResult.token);
      localStorage.setItem('user', JSON.stringify(mockResult.user));
      
      navigate(isAdmin ? '/admin' : '/dashboard');
    } catch (err) {
      setError('Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-6 animate-fadeIn">
      <div className="glass w-full max-w-md p-10 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 blur-3xl rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-600/10 blur-3xl rounded-full"></div>

        <div className="text-center mb-10 relative">
          <div className="w-16 h-16 bg-primary-600/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-500 shadow-xl shadow-primary-500/10">
            <Shield size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-2 italic">Institutional Access</h1>
          <p className="text-slate-500 text-sm">Secure gateway for authorized issuers.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 relative">
          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-500 ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@iitd.ac.in"
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase font-bold text-slate-500 ml-1">Secure Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pl-10 text-sm"
                />
              </div>
            </div>
          </div>

          {error && <div className="text-danger text-sm text-center font-medium bg-danger/10 py-2 rounded-lg border border-danger/20">{error}</div>}

          <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2">
            {loading ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            Authorize Session
          </button>
        </form>

        <div className="mt-8 text-center text-slate-500 text-xs">
          <p>Restricted to authorized identity nodes only.</p>
          <div className="mt-4 flex justify-center gap-4">
            <a href="#" className="hover:text-primary-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary-500 transition-colors">Network Terms</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
