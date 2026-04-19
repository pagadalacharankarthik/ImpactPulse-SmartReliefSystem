import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useDatabaseStore } from '../store/useDatabaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useTranslation } from 'react-i18next';
import { 
  MapPin, Users, CheckCircle, Clock, 
  Map as MapIcon, ClipboardList, Zap, ArrowRight,
  UserCheck, ShieldCheck
} from 'lucide-react';

export const FieldWorkerDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { tasks, updateTaskStatus, updateTaskImpact } = useDatabaseStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();
  
  const [isResolutionModalOpen, setIsResolutionModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [finalImpact, setFinalImpact] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const myTasks = tasks.filter(t => t.assignedWorkers.includes(user?.id || ''));
  const pendingTasks = myTasks.filter(t => t.status !== 'Completed').length;
  const completedTasks = myTasks.filter(t => t.status === 'Completed').length;
  
  const handleStartMission = (taskId: string) => {
    updateTaskStatus(taskId, 'In Progress');
    addToast('Mission started. Ground coordination active.', 'success');
  };

  const handleOpenResolution = (taskId: string, currentAffected: number) => {
    setSelectedTask(taskId);
    setFinalImpact(currentAffected);
    setIsResolutionModalOpen(true);
  };

  const handleFinalizeMission = async () => {
    if (!selectedTask) return;
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 800)); 
    
    updateTaskImpact(selectedTask, finalImpact);
    updateTaskStatus(selectedTask, 'Completed');
    
    addToast(`Mission Resolved. Impact: ${finalImpact} helped.`, 'success');
    setIsResolutionModalOpen(false);
    setIsSubmitting(false);
    setSelectedTask(null);
  };

  return (
    <div className="pt-20 px-4 md:px-8 pb-12 max-w-[1000px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Worker Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 italic flex items-center gap-2">
            <Zap className="h-6 w-6 text-yellow-500 fill-yellow-500"/> {t('fieldOperations')}
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium italic">{t('groundDeployment')}</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
           <Button 
             onClick={() => navigate('/survey')}
             className="flex-1 md:flex-none bg-primary-600 hover:bg-primary-700 text-white gap-2 h-11 px-6 shadow-lg shadow-primary-500/20"
           >
             <ClipboardList className="h-5 w-5" /> {t('submitSurvey')}
           </Button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
         <Card className="rounded-xl border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('activeMissions')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{pendingTasks}</p>
         </Card>
         <Card className="rounded-xl border-gray-200 dark:border-gray-800 p-4 bg-gray-50/50 dark:bg-gray-900/50">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{t('resolvedMissions')}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{completedTasks}</p>
         </Card>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300 uppercase tracking-tight">
          <ArrowRight className="h-5 w-5 text-primary-600"/> {t('currentDispatch')}
        </h3>
        
        {myTasks.length === 0 ? (
          <Card className="rounded-xl border-dashed border-2 flex items-center justify-center p-12 text-gray-500">
            <div className="text-center">
              <UserCheck className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium text-sm">{t('standByOrders')}</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 border-gray-300"
                onClick={() => navigate('/survey')}
              >
                {t('conductProactiveSurvey')}
              </Button>
            </div>
          </Card>

        ) : (
          myTasks.map((task) => (
            <Card key={task.id} className={`rounded-2xl shadow-sm border-gray-200 dark:border-gray-800 transition-all overflow-hidden ${
              task.status === 'Completed' ? 'opacity-70 grayscale' : 'hover:shadow-md'
            }`}>
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className="p-6 flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                        task.priority === 'High' ? 'bg-red-500 text-white' : 
                        task.priority === 'Medium' ? 'bg-yellow-500 text-black' : 
                        'bg-blue-500 text-white'
                      }`}>
                        {task.priority} Priority
                      </span>
                      <span className="text-sm font-bold text-gray-400 capitalize flex items-center gap-1.5 ml-auto">
                        <Clock className="h-3.5 w-3.5" /> {task.status}
                      </span>
                    </div>

                    <h4 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{task.title}</h4>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mb-6">{task.description}</p>

                    <div className="flex flex-wrap gap-6 text-sm text-gray-600 dark:text-gray-300 font-semibold border-t dark:border-gray-800 pt-4">
                      <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-500" /> {task.location}</div>
                      <div className="flex items-center gap-2"><Users className="h-4 w-4 text-primary-500" /> {task.peopleAffected}</div>
                      <div className="flex items-center gap-2"><MapIcon className="h-4 w-4 text-primary-500" /> {t('groundSupport')}</div>
                    </div>
                  </div>

                   {task.status !== 'Completed' && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-6 md:w-64 border-t md:border-t-0 md:border-l border-gray-100 dark:border-gray-800 flex flex-col gap-3 justify-center">
                       {task.status === 'Pending' && (
                         <Button 
                           className="w-full h-12 bg-gray-900 text-white dark:bg-white dark:text-black gap-2 font-bold"
                           onClick={() => handleStartMission(task.id)}
                         >
                           <Zap className="h-4 w-4" /> {t('startMission')}
                         </Button>
                       )}
                       <Button 
                         className="w-full h-12 bg-primary-600 hover:bg-primary-700 text-white gap-2 font-bold shadow-lg shadow-primary-500/10"
                         onClick={() => handleOpenResolution(task.id, task.peopleAffected)}
                       >
                         <CheckCircle className="h-4 w-4" /> {t('markResolved')}
                       </Button>
                    </div>
                  )}

                  {task.status === 'Completed' && (
                    <div className="bg-green-50 dark:bg-green-900/10 p-6 md:w-64 border-t md:border-t-0 md:border-l border-green-100 dark:border-green-900/30 flex items-center justify-center">
                       <span className="flex items-center gap-2 text-green-600 font-black uppercase text-xs">
                         <CheckCircle className="h-6 w-6"/> {t('missionSuccessful')}
                       </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Resolution Modal */}
      <Modal 
        isOpen={isResolutionModalOpen} 
        onClose={() => setIsResolutionModalOpen(false)} 
        title={t('finalOutcomeReport')}
      >
        <div className="space-y-6">
          <div className="p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-800">
             <p className="text-sm font-bold text-primary-700 dark:text-primary-300 mb-1 flex items-center gap-2">
               <ShieldCheck className="h-4 w-4" /> {t('finalMissionData')}
             </p>
             <p className="text-xs text-primary-600/80">{t('inputFinalImpact')}</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-tighter">{t('totalPeopleHelped')}</label>
            <Input 
              type="number" 
              value={finalImpact} 
              onChange={(e) => setFinalImpact(Number(e.target.value))}
              placeholder="e.g. 500"
              className="h-12 text-lg font-bold"
            />
          </div>

          <div className="pt-4 flex gap-3">
             <Button variant="outline" className="flex-1" onClick={() => setIsResolutionModalOpen(false)}>{t('cancel')}</Button>
             <Button 
                className="flex-1 bg-gray-900 text-white dark:bg-white dark:text-black font-bold h-11"
                disabled={isSubmitting}
                onClick={handleFinalizeMission}
             >
               {isSubmitting ? t('syncing') : t('finalizeMission')}
             </Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};
