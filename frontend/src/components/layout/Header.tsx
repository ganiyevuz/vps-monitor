import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../lib/stores/authStore';
import { LogOut, LayoutDashboard, Settings, DollarSign } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 shadow-xl sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
            <span className="text-white font-bold text-lg">V</span>
          </div>
          <span className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
            VPS Monitor
          </span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 transition-colors duration-200 font-medium ${
              location.pathname === '/dashboard'
                ? 'text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            Dashboard
          </Link>
          <Link
            to="/providers"
            className={`flex items-center gap-2 transition-colors duration-200 font-medium ${
              location.pathname === '/providers'
                ? 'text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Settings size={18} />
            Providers
          </Link>
          <Link
            to="/billing"
            className={`flex items-center gap-2 transition-colors duration-200 font-medium ${
              location.pathname === '/billing'
                ? 'text-white'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <DollarSign size={18} />
            Billing
          </Link>

          <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-700">
            <div className="flex flex-col items-end">
              <span className="text-sm font-medium text-white">{user?.username}</span>
              <span className="text-xs text-slate-400">Admin</span>
            </div>
            <button
              onClick={logout}
              className="p-2 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all duration-200"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        </nav>
      </div>
    </header>
  );
}
