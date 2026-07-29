import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  RadioTower,
  Zap
} from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';
import { useAppStore } from '../../store/useAppStore';

const LoginPage = () => {
  const [email, setEmail] = useState('admin@djezzy.dz');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const login = useAppStore(state => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  const redirectTarget = () => {
    const from = (location.state as { from?: { pathname: string; search?: string; hash?: string } } | null)?.from;

    if (!from || from.pathname.startsWith('/login')) return '/';

    return `${from.pathname}${from.search || ''}${from.hash || ''}`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error?.message || 'Connexion echouee');
      }

      login(json.data.token, json.data.user);
      navigate(redirectTarget(), { replace: true });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-on-surface grid lg:grid-cols-[minmax(0,1fr)_600px]">
      <section 
        className="hidden lg:flex min-h-screen bg-cover bg-center border-r border-border-subtle p-12 flex-col justify-center relative overflow-hidden"
        style={{ backgroundImage: 'url("/login-bg.webp")' }}
      >
        <div className="absolute inset-0 bg-black/60 pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-16 max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary text-on-primary grid place-items-center shadow-lg shadow-primary/20">
              <RadioTower className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-display font-bold text-white tracking-tight">DDN</h1>
              <p className="text-base text-white/80 mt-0.5">Djezzy Data Nexus</p>
            </div>
          </div>

          <div>
            <h2 className="text-[3.5rem] font-display font-bold leading-[1.1] text-white tracking-tight">
              Santé des sites, alarmes et opérations numériques dans une seule console.
            </h2>
          </div>
        </div>
      </section>

      <section className="min-h-screen flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-[480px]">
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-md bg-primary text-on-primary grid place-items-center">
              <RadioTower className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-on-surface">DDN</h1>
              <p className="text-sm text-on-surface-variant">Djezzy Data Nexus</p>
            </div>
          </div>

          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-10 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-primary font-mono">Accès sécurisé</p>
                <h2 className="text-3xl font-display font-bold text-on-surface mt-2">Connexion</h2>
                <p className="text-sm text-on-surface-variant mt-2">Utilisez votre compte opérations pour continuer.</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-bg-secondary border border-border-subtle grid place-items-center">
                <Zap className="w-6 h-6 text-primary" />
              </div>
            </div>

            <form onSubmit={handleLogin} className="mt-10 space-y-6">
              {error && (
                <div className="bg-status-critical/10 border border-status-critical/30 text-status-critical text-sm px-4 py-3 rounded-md flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2" htmlFor="email">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-12 bg-background border border-border-subtle rounded-md pl-11 pr-4 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="name@djezzy.dz"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-2" htmlFor="password">
                  Mot de passe
                </label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                  <input
                    id="password"
                    type={passwordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-12 bg-background border border-border-subtle rounded-md pl-11 pr-12 text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors"
                    placeholder="Mot de passe"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    aria-label={passwordVisible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-md text-on-surface-variant hover:text-primary hover:bg-bg-surface transition-colors grid place-items-center"
                  >
                    {passwordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-primary text-on-primary rounded-md font-medium hover:brightness-105 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connexion
                  </>
                ) : (
                  <>
                    Continuer
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>
          </div>


        </div>
      </section>
    </main>
  );
};

export default LoginPage;
