import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore';
import { useAuthStore } from '../store/useAuthStore';
import { Moon, Sun, Globe, LayoutDashboard, ClipboardList, LogOut } from 'lucide-react';
import { Button } from './ui/Button';

export const Navigation = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage } = useAppStore();
  const { user, isAuthenticated, logout } = useAuthStore();

  const handleLanguageChange = () => {
    const langs: ('en' | 'hi' | 'te')[] = ['en', 'hi', 'te'];
    const nextLang = langs[(langs.indexOf(language) + 1) % langs.length];
    setLanguage(nextLang);
    i18n.changeLanguage(nextLang);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [];
  if (isAuthenticated) {
    navItems.push({ to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') });
    if (user?.role === 'worker' || user?.role === 'volunteer') {
      navItems.push({ to: '/survey', icon: ClipboardList, label: t('survey') });
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6 shadow-sm">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 font-bold cursor-pointer" onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500 text-white font-bold text-xl">I</div>
          <span className="text-xl tracking-tight text-primary-600 dark:text-primary-500 hidden sm:block">
            {t('appName')}
          </span>
        </div>
        
        <div className="hidden md:flex gap-1 ml-6">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/50 dark:text-primary-100' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`
              }
            >
              <Icon className="h-4 w-4" /> {label}
            </NavLink>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {isAuthenticated && <span className="mr-4 text-sm font-medium hidden md:block text-gray-500 border-r pr-4 border-gray-200">Role: <span className="uppercase text-primary-600">{user?.role}</span></span>}
        
        <Button variant="ghost" size="sm" onClick={handleLanguageChange} className="gap-2 hidden sm:flex">
          <Globe className="h-4 w-4" /> <span className="uppercase">{language}</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={toggleTheme}>
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>

        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleLogout} className="ml-2 gap-2 text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20">
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
            </Button>
            <div className="h-9 w-9 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 ml-2 cursor-pointer hover:bg-gray-200 transition-colors">
              {user?.role === 'admin' ? 'A' : user?.name.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <Button size="sm" onClick={() => navigate('/auth')} className="ml-2">SignIn</Button>
        )}
      </div>
    </nav>
  );
};
