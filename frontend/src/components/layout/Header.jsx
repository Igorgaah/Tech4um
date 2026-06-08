import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useSocket } from '../../hooks/useSocket';
import Avatar from '../common/Avatar';

export default function Header({ title, subtitle }) {
  const { user, logout } = useAuth();
  const { isConnected } = useSocket();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-dark-600 bg-dark-800 flex-shrink-0">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="text-xl font-bold text-brand-400 hover:text-brand-300 transition-colors">
          Tech4um
        </Link>
        {title && (
          <>
            <span className="text-dark-500">/</span>
            <div>
              <h1 className="text-sm font-semibold text-white leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-dark-400 leading-tight">{subtitle}</p>}
            </div>
          </>
        )}
      </div>

      {/* Right: Status + User menu */}
      <div className="flex items-center gap-3">
        {/* Connection status */}
        <div className="hidden sm:flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse-soft'}`} />
          <span className={`text-xs ${isConnected ? 'text-green-400' : 'text-yellow-400'}`}>
            {isConnected ? 'Conectado' : 'Reconectando...'}
          </span>
        </div>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-dark-600 transition-colors"
          >
            <Avatar username={user?.username} size="sm" />
            <span className="hidden sm:block text-sm text-dark-100">{user?.username}</span>
            <svg className="w-4 h-4 text-dark-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-48 bg-dark-700 border border-dark-500 rounded-xl shadow-xl z-50 animate-slide-up overflow-hidden">
              <div className="px-4 py-3 border-b border-dark-600">
                <p className="text-sm font-medium text-white">{user?.username}</p>
                <p className="text-xs text-dark-400 truncate">{user?.email}</p>
              </div>
              <Link
                to="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm text-dark-200 hover:bg-dark-600 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:bg-red-600/10 hover:text-red-300 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sair
              </button>
            </div>
          )}

          {menuOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
          )}
        </div>
      </div>
    </header>
  );
}
