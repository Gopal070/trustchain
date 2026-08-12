import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Menu, X, LogOut } from 'lucide-react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Verify', path: '/verify' },
    { name: 'Issuer Portal', path: '/dashboard', protected: true },
    { name: 'Admin', path: '/admin', adminOnly: true },
  ];

  const filteredLinks = navLinks.filter(link => {
    if (link.adminOnly && user?.role !== 'admin') return false;
    if (link.protected && !user) return false;
    return true;
  });

  return (
    <nav className="glass sticky top-0 z-50 px-6 py-4 mb-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group">
          <Shield className="text-primary-500 group-hover:scale-110 transition-transform" size={32} />
          <span className="text-2xl font-bold">
            Trust<span className="text-primary-500">Chain</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {filteredLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`nav-link ${location.pathname === link.path ? 'text-white border-b-2 border-primary-500' : ''}`}
            >
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <div className="flex items-center gap-4 pl-4 border-l border-white/10">
              <span className="text-sm font-medium text-slate-300">{user.name}</span>
              <button 
                onClick={handleLogout}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-danger"
                title="Logout"
              >
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary py-2 px-5 text-sm">Issuer Login</Link>
          )}
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 w-full glass p-6 border-t border-white/10 animate-fadeIn">
          <div className="flex flex-col gap-4">
            {filteredLinks.map((link) => (
              <Link key={link.path} to={link.path} onClick={() => setIsOpen(false)} className="text-lg py-2 border-b border-white/5">
                {link.name}
              </Link>
            ))}
            {!user && <Link to="/login" className="btn-primary text-center mt-4">Login</Link>}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Header;
