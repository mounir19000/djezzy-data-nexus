import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { Shield, Lock, Mail, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@djezzy.dz');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAppStore(state => state.login);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:4000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || 'Login failed');
      }

      login(json.data.token, json.data.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-bg-surface border border-border-subtle rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8 text-center border-b border-border-subtle bg-bg-secondary">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 text-primary mb-4">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold text-on-surface">Djezzy SSOP</h1>
          <p className="text-sm font-sans text-on-surface-variant mt-1">Smart Site Operations Platform</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="bg-status-critical/10 border border-status-critical/20 text-status-critical text-sm px-4 py-3 rounded-md">
                {error}
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Corporate Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-md pl-10 pr-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface-variant mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-background border border-border-subtle rounded-md pl-10 pr-4 py-2.5 text-on-surface focus:outline-none focus:border-primary transition-colors"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-on-primary py-2.5 rounded-md font-sans font-medium hover:bg-primary-fixed-dim transition-colors flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
      <p className="text-xs text-on-surface-variant mt-8 font-mono">Djezzy © 2026. Authorized Personnel Only.</p>
    </div>
  );
};

export default LoginPage;
