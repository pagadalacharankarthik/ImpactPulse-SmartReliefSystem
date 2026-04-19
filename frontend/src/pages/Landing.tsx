import { Globe2, ShieldCheck, Users2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '../components/ui/Button';

export const Landing = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background flex flex-col pt-16">
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 md:px-6 flex flex-col justify-center items-center text-center space-y-12 animate-in fade-in zoom-in duration-500">
        
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300 text-sm font-semibold">
            <Globe2 className="h-4 w-4" />
            {t('aiAssisted')}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-gray-50 flex flex-col gap-2">
            <span>{t('respondFaster')}</span>
            <span className="text-primary-600 dark:text-primary-500">{t('impactDeeper')}</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
            {t('landingDesc')}
          </p>
          <div className="pt-4 flex items-center justify-center gap-4">
            <Button size="lg" className="text-lg px-8 gap-2" onClick={() => navigate('/auth')}>
              {t('getStarted')} <ArrowRight className="h-5 w-5" />
            </Button>
          </div>

        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-12 w-full text-left">
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">{t('adminCommand')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('adminCommandDesc')}</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-xl flex items-center justify-center">
              <Users2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">{t('volunteerManagement')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('volunteerManagementDesc')}</p>
          </div>
          <div className="p-6 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-4">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-xl flex items-center justify-center">
              <Globe2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold">{t('offlineAgents')}</h3>
            <p className="text-gray-600 dark:text-gray-400">{t('offlineAgentsDesc')}</p>
          </div>
        </div>

      </main>
    </div>
  );
};
