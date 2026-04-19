import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { syncService } from '../services/offlineSync';
import { useToastStore } from '../store/useToastStore';
import { useDatabaseStore } from '../store/useDatabaseStore';
import { Wifi, WifiOff, CheckCircle2 } from 'lucide-react';

export const SurveyForm = () => {
  const { t } = useTranslation();
  const { addToast } = useToastStore();
  const { addSurvey } = useDatabaseStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<{
    problemType: string;
    severity: 'High' | 'Medium' | 'Low';
    peopleAffected: number;
    location: string;
  }>({
    problemType: '',
    severity: 'Medium',
    peopleAffected: 0,
    location: ''
  });

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const surveyData = {
      id: crypto.randomUUID(),
      ...formData,
      timestamp: Date.now(),
    };

    try {
      await syncService.saveSurvey(surveyData);
      addSurvey(surveyData as any); // Sync to our active in-memory global state
      setSubmitted(true);
      addToast(isOnline ? 'Survey synced successfully' : 'Survey saved for later sync', 'success');
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ problemType: '', severity: 'Medium', peopleAffected: 0, location: '' });
      }, 3000);
    } catch (error) {
      addToast('Failed to save survey', 'error');
      console.error('Error saving survey:', error);
    }
  };

  return (
    <div className="pt-24 px-4 pb-8 max-w-2xl mx-auto">
      <Card className="relative overflow-hidden">
        {/* Offline indicator bar */}
        <div className={`absolute top-0 left-0 right-0 h-1.5 ${isOnline ? 'bg-green-500' : 'bg-yellow-500'}`} />
        
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl">{t('survey')}</CardTitle>
          <div className="flex items-center gap-2 text-sm font-medium">
            {isOnline ? (
              <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400">
                <Wifi className="h-4 w-4" /> Online
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-yellow-600 dark:text-yellow-400">
                <WifiOff className="h-4 w-4" /> Offline (Will sync later)
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center animate-in zoom-in duration-300">
              <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
              <h3 className="text-xl font-semibold mb-2">Survey Saved!</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {isOnline ? 'Data synced successfully to the cloud.' : 'Data saved locally and will sync when online.'}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in duration-300">
              <div className="space-y-2">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 dark:text-gray-300">
                  {t('location')}
                </label>
                <div className="flex gap-2">
                  <Input 
                    required 
                    placeholder="E.g. Secunderabad Station" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                  <Button type="button" variant="outline" onClick={() => {
                    if (navigator.geolocation) {
                      navigator.geolocation.getCurrentPosition((pos) => {
                        setFormData({...formData, location: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`});
                      });
                    }
                  }}>GPS</Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
                  {t('problemType')}
                </label>
                <select 
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:border-gray-700 dark:bg-gray-900"
                  value={formData.problemType}
                  onChange={(e) => setFormData({...formData, problemType: e.target.value})}
                >
                  <option value="" disabled>Select a problem type</option>
                  <option value="Food Shortage">Food Shortage</option>
                  <option value="Medical Emergency">Medical Emergency</option>
                  <option value="Shelter Overcrowding">Shelter Need</option>
                  <option value="Drinking Water">Drinking Water</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
                  {t('severity')}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['Low', 'Medium', 'High'].map((level) => (
                    <label 
                      key={level}
                      className={`flex cursor-pointer items-center justify-center rounded-md border p-3 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 ${
                        formData.severity === level 
                          ? level === 'High' ? 'border-red-500 bg-red-50/50 text-red-700 dark:bg-red-900/20' 
                            : level === 'Medium' ? 'border-yellow-500 bg-yellow-50/50 text-yellow-700 dark:bg-yellow-900/20'
                            : 'border-green-500 bg-green-50/50 text-green-700 dark:bg-green-900/20'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name="severity" 
                        value={level} 
                        className="sr-only"
                        checked={formData.severity === level}
                        onChange={(e) => setFormData({...formData, severity: e.target.value as 'High' | 'Medium' | 'Low'})}
                      />
                      {t(level.toLowerCase())}
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium leading-none text-gray-700 dark:text-gray-300">
                  {t('peopleAffected')}
                </label>
                <Input 
                  type="number" 
                  min="1" 
                  required 
                  value={formData.peopleAffected || ''}
                  onChange={(e) => setFormData({...formData, peopleAffected: parseInt(e.target.value) || 0})}
                />
              </div>

              <Button type="submit" className="w-full text-base py-5 mt-4" size="lg">
                {t('submit')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
