import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useDatabaseStore } from '../store/useDatabaseStore';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  MapPin, Users, CheckCircle, Clock, ShieldAlert,
  LayoutDashboard, ListTodo, Users2, Activity
} from 'lucide-react';


export const VolunteerPanel = () => {
  const { t } = useTranslation();
  const { tasks, users, assignWorkerToTask } = useDatabaseStore();
  const { user } = useAuthStore();
  const { addToast } = useToastStore();

  const myTasks = tasks.filter(t => t.assignedVolunteer === user?.id);
  const activeTasks = myTasks.filter(t => t.status !== 'Completed').length;
  const availableWorkers = users.filter(u => u.role === 'worker');

  const handleAssignWorker = (taskId: string, workerId: string) => {
    assignWorkerToTask(taskId, workerId);
    const worker = users.find(u => u.id === workerId);
    addToast(`Mission delegated to ${worker?.name}`, 'success');
  };

  return (
    <div className="pt-20 px-4 md:px-8 pb-12 max-w-[1200px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Area */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 italic flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-primary-600"/> {t('volunteerCommand')}
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">{t('regionalOperations')}</p>
        </div>
        <div className="flex gap-3">
           <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-semibold flex items-center gap-2 border border-gray-200 dark:border-gray-700">
             <Activity className="h-4 w-4 text-green-500" /> {activeTasks} {t('activeMissions')}
           </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Tasks List */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-lg font-bold flex items-center gap-2 mb-4 text-gray-700 dark:text-gray-300">
            <ListTodo className="h-5 w-5"/> {t('assignedMissions')}
          </h3>
          
          {myTasks.length === 0 ? (
            <Card className="rounded-xl border-dashed border-2 flex items-center justify-center p-12 text-gray-500">
              <div className="text-center">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>{t('noMissions')}</p>
              </div>
            </Card>

          ) : (
            myTasks.map((task) => (
              <Card key={task.id} className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800 hover:shadow-md transition-all overflow-hidden relative">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-blue-500'
                }`}></div>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-xl font-bold mb-1">{task.title}</h4>
                      <p className="text-sm text-gray-500 max-w-lg">{task.description}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      task.status === 'Completed' ? 'bg-green-100 text-green-700' : 'bg-primary-100 text-primary-700'
                    }`}>
                      {task.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{t('severity')}</p>
                      <p className={`text-sm font-bold ${task.priority === 'High' ? 'text-red-500' : ''}`}>{task.priority}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{t('location')}</p>
                      <p className="text-sm font-bold flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> {task.location}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{t('targetAffected')}</p>
                      <p className="text-sm font-bold">{task.peopleAffected}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">{t('deployment')}</p>
                      <p className="text-sm font-bold">{task.assignedWorkers.length}</p>
                    </div>
                  </div>

                  {/* Worker Management Block */}
                  <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h5 className="text-sm font-bold mb-4 flex items-center gap-2">
                       <Users2 className="h-4 w-4 text-primary-600"/> {t('deploymentTeam')}
                    </h5>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {task.assignedWorkers.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">No field personnel deployed yet.</p>
                      ) : (
                        task.assignedWorkers.map(wId => {
                          const w = users.find(u => u.id === wId);
                          return (
                            <div key={wId} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold flex items-center gap-2 border border-gray-200 dark:border-gray-700">
                              <div className="h-4 w-4 bg-primary-500 rounded-full flex items-center justify-center text-[8px] text-white">
                                {w?.name.charAt(0)}
                              </div>
                              {w?.name}
                              <CheckCircle className="h-3 w-3 text-green-500 ml-1" />
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="flex gap-3">
                      <select 
                        disabled={task.status === 'Completed'}
                        className="text-sm border border-gray-200 dark:border-gray-800 rounded-lg p-2.5 dark:bg-gray-900 flex-1 max-w-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        onChange={(e) => handleAssignWorker(task.id, e.target.value)}
                        value=""
                      >
                        <option value="" disabled>{t('deployPersonnel')}</option>
                        {availableWorkers.filter(w => !task.assignedWorkers.includes(w.id)).map(w => (
                          <option key={w.id} value={w.id}>{w.name} ({w.region})</option>
                        ))}
                      </select>
                      <Button 
                        variant="outline" 
                        className="text-xs font-bold border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                        onClick={() => document.getElementById('regional-map-view')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        {t('regionalMap')}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Right Column: Stats & Alerts */}
        <div className="space-y-6">
            <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800 p-6 bg-primary-600 text-white overflow-hidden relative">
              <ShieldAlert className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 rotate-12" />
              <h4 className="text-lg font-bold mb-2">Suresh's {t('commandProtocol')}</h4>
              <p className="text-sm text-primary-100 font-medium leading-relaxed">
                {t('commandDesc')}
              </p>
            </Card>

            <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800 p-6">
              <h4 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                <Users className="h-4 w-4"/> {t('deploymentInsight')}
              </h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600 dark:text-gray-400">{t('teamUtilization')}</span>
                   <span className="font-bold text-green-500">84%</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600 dark:text-gray-400">{t('personnelOnGround')}</span>
                   <span className="font-bold text-blue-500">{users.filter(u => u.role === 'worker' && tasks.some(t => t.assignedWorkers.includes(u.id))).length}</span>
                 </div>
                 <div className="flex justify-between items-center">
                   <span className="text-sm text-gray-600 dark:text-gray-400">{t('avgDeploymentTime')}</span>
                   <span className="font-bold">12m</span>
                 </div>
              </div>
            </Card>

           <Card id="regional-map-view" className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800 p-1 overflow-hidden scroll-mt-24">
               <div className="h-64 relative bg-gray-100 dark:bg-gray-900 border-t-2 border-primary-500 z-0">
                  <MapContainer 
                    // @ts-ignore
                    center={[17.3850, 78.4867]} 
                    // @ts-ignore
                    zoom={11} 
                    style={{ height: '100%', width: '100%' }}
                    // @ts-ignore
                    zoomControl={false}
                  >
                    <TileLayer
                      // @ts-ignore
                      url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    />

                    {myTasks.filter(t => t.lat && t.lng).map((task) => {
                      let circleColor = '#fb923c'; 
                      if (task.status === 'Completed') circleColor = '#22c55e';
                      else if (task.status === 'Pending') circleColor = '#3b82f6';
                      else if (task.priority === 'High') circleColor = '#ef4444';

                      return (
                      <Circle
                        key={task.id}
                        // @ts-ignore
                        center={[task.lat!, task.lng!]}
                        // @ts-ignore
                        radius={500}
                        pathOptions={{
                          fillColor: circleColor,
                          color: circleColor,
                          weight: 2,
                          fillOpacity: 0.5,
                          className: task.status !== 'Completed' ? 'animate-pulse-slow' : ''
                        }}
                      >
                         <Popup 
                           // @ts-ignore
                           className="custom-popup"
                         >
                            <div className="p-1 min-w-[150px]">
                               <h4 className="font-bold text-xs mb-1">{task.title}</h4>
                               <p className="text-[9px] text-gray-500">{task.location}</p>
                            </div>
                         </Popup>
                      </Circle>
                      );
                    })}
                 </MapContainer>
               </div>
           </Card>
        </div>
      </div>
    </div>
  );
};
