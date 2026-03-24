import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/', { replace: true });
    } catch {
      setError('Invalid username or password. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-brand-navy flex-col justify-between p-16">
        <div className="flex items-center gap-3">
          <div className="size-10 bg-brand-blue rounded-lg flex items-center justify-center">
            <span className="font-bold text-xl text-white">E</span>
          </div>
          <span className="text-white font-semibold text-xl tracking-tight">
            ESTAM University Clinic
          </span>
        </div>

        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white leading-tight">
            Patient care, <br />
            <span className="text-brand-blue">simplified.</span>
          </h1>
          <p className="text-slate-300 text-lg leading-relaxed max-w-sm">
            A unified platform for managing patient records, appointments, and
            clinical notes — purpose-built for ESTAM University Health Services.
          </p>
        </div>

        <p className="text-slate-500 text-sm">
          © {new Date().getFullYear()} ESTAM University. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-sm space-y-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <div className="size-9 bg-brand-navy rounded-lg flex items-center justify-center">
              <span className="font-bold text-lg text-white">E</span>
            </div>
            <span className="font-semibold text-slate-900 text-lg">
              ESTAM Clinic
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Enter your credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
                className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm text-slate-900"
                placeholder="e.g. dr.johnson"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 bg-white border border-slate-200 focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/10 rounded-lg outline-none transition-all text-sm text-slate-900"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-blue text-white rounded-lg text-sm font-semibold hover:bg-brand-blue/90 transition-colors shadow-md shadow-brand-blue/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}