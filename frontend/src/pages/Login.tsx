import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../lib/api/auth';
import { useAuthStore } from '../lib/stores/authStore';
import { usePageTitle } from '../lib/hooks/usePageTitle';

export function LoginPage() {
  usePageTitle('Login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { access, refresh } = await authApi.login({ username, password });
      setToken(access, refresh);

      // Optionally fetch user info if you have an endpoint
      setUser({
        id: 0,
        username,
        email: '',
      });

      navigate('/dashboard');
    } catch (err) {
      setError('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="card-premium p-8 space-y-8">
          {/* Logo & Title */}
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <span className="text-white font-bold text-2xl">V</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              VPS Monitor
            </h1>
            <p className="text-slate-500 text-sm">Multi-cloud VPS management</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm flex gap-3">
              <span className="text-red-600 font-bold">•</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-premium"
                placeholder="Enter your username"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-premium"
                placeholder="Enter your password"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Logging in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500">
            Protected by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}
