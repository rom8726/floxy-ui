import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Workflow, Database, AlertCircle, BarChart3, Sun, Moon } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'dark';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/workflows', label: 'Workflows', icon: Workflow },
    { path: '/instances', label: 'Instances', icon: Database },
    { path: '/dlq', label: 'Dead Letter Queue', icon: AlertCircle },
    { path: '/stats', label: 'Statistics', icon: BarChart3 },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header 
        className="shadow-lg relative overflow-hidden mb-8"
        style={{
          background: 'linear-gradient(180deg, var(--bg-secondary) 0%, rgba(17, 17, 17, 0.95) 100%)',
          borderBottom: '1px solid var(--border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(10px)',
        }}
      >
        <div className="container relative z-10">
          <nav className="flex items-center justify-between py-5">
            <div className="flex items-center gap-3">
              <div 
                className="px-4 py-2 rounded-lg border shadow-md backdrop-blur-sm"
                style={{
                  background: 'var(--bg-tertiary)',
                  borderColor: 'var(--border)',
                }}
              >
                <h1 
                  className="text-2xl font-bold tracking-wide"
                  style={{ color: 'var(--text-primary)' }}
                >
                  Floxy UI
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
                      transition-all duration-300 relative overflow-hidden
                      ${active ? 'shadow-lg scale-105' : 'hover:scale-105'}
                    `}
                    style={{
                      background: active 
                        ? 'linear-gradient(135deg, var(--gradient-start), var(--gradient-end))'
                        : 'var(--bg-tertiary)',
                      color: active ? 'white' : 'var(--text-secondary)',
                      border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = 'var(--text-primary)';
                        e.currentTarget.style.borderColor = 'var(--accent)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                        e.currentTarget.style.borderColor = 'var(--border)';
                      }
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                    {active && (
                      <div 
                        className="absolute bottom-0 left-0 w-full h-0.5"
                        style={{ background: 'var(--accent)' }}
                      />
                    )}
                  </Link>
                );
              })}
              <button
                onClick={toggleTheme}
                className="px-3 py-2 rounded-lg border transition-all duration-200 flex items-center gap-2"
                style={{
                  background: 'var(--bg-tertiary)',
                  borderColor: 'var(--border)',
                  color: 'var(--text-primary)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                  e.currentTarget.style.borderColor = 'var(--accent)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--bg-tertiary)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }}
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? (
                  <Sun size={18} />
                ) : (
                  <Moon size={18} />
                )}
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="container pb-8">
        {children}
      </main>
    </div>
  );
};
