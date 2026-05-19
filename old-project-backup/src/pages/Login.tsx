import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verifyAdmin } from '../lib/auth';
import { isAuthenticated } from '../lib/session';

export default function LoginPage({ onLogin, hasAdmin }: { onLogin: (adminId: number) => void; hasAdmin: boolean }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
  }, [navigate]);

  if (!hasAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-900/5">
          <h1 className="text-3xl font-semibold text-slate-950">Welcome</h1>
          <p className="mt-3 text-slate-500">No admin account found. Please complete setup first.</p>
          <button onClick={() => navigate('/setup')} className="mt-6 w-full rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500">
            Start Setup
          </button>
        </div>
      </div>
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const admin = await verifyAdmin(username, password);
      if (!admin) {
        setError('Incorrect username or password.');
        return;
      }
      onLogin(admin.id);
      navigate('/');
    } catch (err) {
      setError('Login failed.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200/70 bg-white p-8 shadow-xl shadow-slate-900/5">
        <div className="mb-6 flex items-center justify-between rounded-3xl bg-blue-600 px-4 py-4 text-white shadow-lg shadow-blue-600/10">
          <div>
            <p className="text-sm uppercase tracking-[0.35em]">Nexus POS</p>
            <h1 className="mt-2 text-2xl font-semibold">Admin login</h1>
          </div>
        </div>
        <p className="text-slate-500">Secure local login for your store.</p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500"
            />
          </div>
          {error && <div className="rounded-3xl border border-rose-200 bg-rose-100/80 px-4 py-3 text-sm text-rose-700">{error}</div>}
          <button
            disabled={loading}
            className="w-full rounded-3xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}
