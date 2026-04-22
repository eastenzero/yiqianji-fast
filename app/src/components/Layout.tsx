import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, FileEdit, BarChart2, User, Stethoscope, Bell, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/record', icon: FileEdit, label: '记录' },
  { path: '/summary', icon: Sparkles, label: '摘要' },
  { path: '/report', icon: BarChart2, label: '报告' },
  { path: '/profile', icon: User, label: '我的' },
];

export default function Layout() {
  const location = useLocation();

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* Top App Bar */}
      <header className="bg-surface/80 backdrop-blur-xl w-full fixed top-0 z-50 shadow-[0_4px_20px_-2px_rgba(25,28,29,0.04)]">
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Stethoscope className="text-primary-container w-7 h-7" />
            <h1 className="text-xl md:text-2xl font-bold text-primary tracking-tight font-headline">
              医前记
            </h1>
          </div>
          <button
            className="text-primary p-2 hover:bg-surface-container rounded-full transition-colors active:scale-95 duration-200"
            aria-label="通知"
          >
            <Bell className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto pt-24 px-4 sm:px-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 w-full rounded-t-[2rem] z-50 bg-white/90 backdrop-blur-2xl shadow-[0_-8px_32px_rgba(0,102,136,0.06)]">
        <div className="max-w-md md:max-w-2xl mx-auto flex justify-around items-center px-2 pb-6 pt-3">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center px-4 py-2 transition-all duration-200 active:scale-90 min-w-[56px]',
                  isActive
                    ? 'text-primary'
                    : 'text-outline hover:text-primary-container',
                )}
              >
                <div
                  className={cn(
                    'p-2 rounded-2xl transition-colors',
                    isActive ? 'bg-primary-fixed' : '',
                  )}
                >
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className="text-[11px] font-bold tracking-wide font-label mt-0.5">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
