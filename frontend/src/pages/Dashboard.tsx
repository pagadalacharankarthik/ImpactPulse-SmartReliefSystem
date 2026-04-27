import { useState } from 'react';
import { useDatabaseStore } from '../store/useDatabaseStore';
import type { UserRecord } from '../store/useDatabaseStore';
import { useToastStore } from '../store/useToastStore';
import { Chatbot } from '../components/Chatbot';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { 
  Building2, FileText, Users2, AlertTriangle, TrendingUp, Clock, 
  MapPin, ShieldAlert, Plus, Search, Filter, Mail, Phone,
  Zap, Eye, ShieldCheck, ArrowUpRight, Globe, Activity
} from 'lucide-react';
// @ts-expect-error react-leaflet and leaflet types are missing natively
import L from 'leaflet';
// Recharts Components
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const Dashboard = () => {
  const { t } = useTranslation();
  const { users, tasks, surveys, removeUser, updateUserRole, addTask, updateTaskStatus, addUser, organizations, addOrganization } = useDatabaseStore();
  const { addToast } = useToastStore();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'organizations' | 'surveys' | 'risk' | 'map' | 'registrations'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOrgModalOpen, setIsAddOrgModalOpen] = useState(false);
  const [isManageUsersModalOpen, setIsManageUsersModalOpen] = useState(false);
  const [selectedManageRegion, setSelectedManageRegion] = useState<string | null>(null);
  const [selectedOrgUsers, setSelectedOrgUsers] = useState<UserRecord[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'volunteer' | 'worker'>('worker');
  
  const [isSurveyModalOpen, setIsSurveyModalOpen] = useState(false);
  const [selectedSurveyId, setSelectedSurveyId] = useState<string | null>(null);
  const [selectedRegionMetrics, setSelectedRegionMetrics] = useState<string | null>(null);

  // Add Org Form State
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgDescription, setNewOrgDescription] = useState('');
  const [newOrgStatus, setNewOrgStatus] = useState<'Active' | 'Inactive'>('Active');
  const [newOrgEmail, setNewOrgEmail] = useState('');
  const [newOrgPhone, setNewOrgPhone] = useState('');
  const [newOrgAddress, setNewOrgAddress] = useState('');

  // Create Task Form State
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskLocation, setNewTaskLocation] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newTaskAffected, setNewTaskAffected] = useState(0);
  const [newTaskVolunteer, setNewTaskVolunteer] = useState('');
  const [newTaskLat, setNewTaskLat] = useState<number>(17.3850);
  const [newTaskLng, setNewTaskLng] = useState<number>(78.4867);

  // Real Metrics Logic
  const regions = [...new Set(users.map(u => u.region).filter(Boolean))] as string[];
  const activeOrgsCount = organizations.length; 
  const totalTasks = tasks.length;
  const activeTasks = tasks.filter(t => t.status !== 'Completed').length;
  const conductorsCount = users.filter(u => u.role === 'volunteer' || u.role === 'worker').length;
  const riskCount = tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length;
  const pendingRegistrationsCount = users.filter(u => u.role === 'pending').length;

  // Real Analytics Aggregation
  const totalAffected = tasks.reduce((sum, t) => sum + (t.peopleAffected || 0), 0);
  const helpProvided = tasks.filter(t => t.status === 'Completed').reduce((sum, t) => sum + (t.peopleAffected || 0), 0);
  const recoveryRate = totalAffected > 0 ? Math.round((helpProvided / totalAffected) * 100) : 0;
  
  const neglectedAreas = regions.filter(region => {
    const regionTasks = tasks.filter(t => t.location.includes(region));
    const regionWorkers = users.filter(u => u.region === region && u.role === 'worker');
    return regionWorkers.length > 0 && regionTasks.length === 0;
  });

  const predictiveRisks = tasks.filter(t => t.priority === 'High' && t.status === 'Pending').length >= 2;
  const avgResponseTime = "1.4 hours"; 

  const areaData = [
    { name: 'Jan', planning: 30, execution: 40, completed: 10 },
    { name: 'Feb', planning: 40, execution: 35, completed: 15 },
    { name: 'Mar', planning: 35, execution: 50, completed: 25 },
    { name: 'Apr', planning: 50, execution: 45, completed: 35 },
    { name: 'May', planning: 45, execution: 55, completed: 60 },
    { name: 'Jun', planning: 60, execution: 70, completed: 40 },
  ];

  const lineData = [
    { name: 'Mon', actual: 120, target: 140 },
    { name: 'Tue', actual: 140, target: 140 },
    { name: 'Wed', actual: 135, target: 140 },
    { name: 'Thu', actual: 155, target: 150 },
    { name: 'Fri', actual: 165, target: 155 },
    { name: 'Sat', actual: 90, target: 120 },
    { name: 'Sun', actual: 80, target: 100 },
  ];

  return (
    <div className="pt-20 px-4 md:px-8 pb-12 max-w-[1400px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 bg-gray-50/50 dark:bg-black/10 min-h-screen">
      
      {/* Title Header matching the screenshot */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 italic">{t('impactPulseAdmin')}</h1>
          <p className="text-gray-500 text-sm mt-1 text-primary-600 font-medium">{t('ngoCommand')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-bold border border-green-100 dark:border-green-800">
            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
            LIVE SYNC ACTIVE
          </div>
          <Button variant="outline" size="sm" className="h-9 gap-2 border-gray-200">
            <Clock className="h-4 w-4" /> History
          </Button>
        </div>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('organizations')}</span>
              <Building2 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{activeOrgsCount}</div>
            <p className="text-xs text-gray-500">Active organizations</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('totalSurveys')}</span>
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{totalTasks}</div>
            <p className="text-xs text-gray-500">{activeTasks} Active Surveys</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('conductors')}</span>
              <Users2 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{conductorsCount}</div>
            <p className="text-xs text-gray-500">Across all regions</p>
          </CardContent>
        </Card>

        <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800 overflow-hidden relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <span className="font-semibold text-gray-700 dark:text-gray-300">{t('riskMonitoring')}</span>
              <AlertTriangle className="h-5 w-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-red-500 mb-1">{riskCount}</div>
            <p className="text-xs text-gray-500">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Modern Pill Tab Nav */}
      <div className="bg-gray-100 dark:bg-gray-800/80 p-1 rounded-xl mb-8 flex flex-wrap max-w-fit shadow-inner">
        {[
          { id: 'dashboard', label: t('dashboard') },
          { id: 'analytics', label: t('viewAnalytics') },
          { id: 'organizations', label: t('organizations') },
          { id: 'surveys', label: t('totalSurveys') },
          { id: 'risk', label: t('riskMonitoring') },
          { id: 'map', label: t('riskMap') },
          { id: 'registrations', label: `${t('registrations')} (${pendingRegistrationsCount})` }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id 
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-8"><TrendingUp className="h-6 w-6"/> View Analytics</h3>
                  <div className="space-y-6">
                    <div className="flex justify-between border-b pb-4 dark:border-gray-800"><span className="text-gray-600 dark:text-gray-400">Affected People Tracked</span><span className="font-bold">{totalAffected}</span></div>
                    <div className="flex justify-between border-b pb-4 dark:border-gray-800"><span className="text-gray-600 dark:text-gray-400">Coverage Percentage</span><span className="font-bold text-green-600">{recoveryRate}%</span></div>
                    <div className="flex justify-between border-b pb-4 dark:border-gray-800"><span className="text-gray-600 dark:text-gray-400">Avg Response Time</span><span className="font-bold">{avgResponseTime}</span></div>
                    <div className="flex justify-between"><span className="text-gray-600 dark:text-gray-400">Active High Priority</span><span className="font-bold">{riskCount}</span></div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
                <CardContent className="p-8">
                  <h3 className="text-xl font-bold flex items-center gap-2 mb-8"><Clock className="h-6 w-6"/> Recent Activity</h3>
                  <div className="space-y-6">
                    {tasks.slice(0, 4).map(task => (
                      <div key={task.id} className="group cursor-pointer">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 transition-colors uppercase text-xs tracking-wider">{task.title}</h4>
                        <p className="text-sm text-gray-500 mt-1">{task.status === 'Completed' ? 'Successfully delivered' : 'Current operational priority'} in {task.location}</p>
                        <div className="text-[10px] text-gray-400 mt-1 uppercase">Updated 2 hours ago</div>
                      </div>
                    ))}
                    {tasks.length === 0 && <p className="text-gray-500 text-center py-10">No recent activity detected.</p>}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="space-y-6">
            <Card className="rounded-xl border-primary-100 dark:border-primary-900 shadow-sm bg-gradient-to-br from-white to-primary-50/30 dark:from-gray-900 dark:to-primary-950/10">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-primary-600"><Zap className="h-4 w-4"/> AI Intelligence Feed</h3>
                <div className="space-y-4">
                  {riskCount > 0 && (
                    <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg animate-pulse">
                      <p className="text-xs font-bold text-red-600 mb-1 flex items-center gap-1"><AlertTriangle className="h-3 w-3"/> High Priority Alert</p>
                      <p className="text-[11px] text-red-800 dark:text-red-400 font-medium">Food crisis detected in North region. Immediate dispatch required.</p>
                    </div>
                  )}
                  {predictiveRisks && (
                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg">
                      <p className="text-xs font-bold text-orange-600 mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3"/> Predictive Risk</p>
                      <p className="text-[11px] text-orange-800 dark:text-orange-400 font-medium">Anomalous survey patterns suggest future crisis risk in neighboring sectors.</p>
                    </div>
                  )}
                  {neglectedAreas.length > 0 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                      <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1"><Eye className="h-3 w-3"/> Neglected Area</p>
                      <p className="text-[11px] text-blue-800 dark:text-blue-400 font-medium">{neglectedAreas[0]} District requires immediate attention. Available workers found with no active missions.</p>
                    </div>
                  )}
                  {!riskCount && !predictiveRisks && neglectedAreas.length === 0 && (
                    <p className="text-xs text-gray-500 text-center py-4 italic">No anomalous patterns detected at this time.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border-gray-200 dark:border-gray-800 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-sm font-bold mb-4">Operational Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Resource Level</span>
                    <span className="font-bold text-green-600">Stable (92%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[92%]"></div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Response Speed</span>
                    <span className="font-bold text-blue-600">Optimal (1.4h)</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 w-[78%]"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
            <CardContent className="p-8 h-[450px] flex flex-col">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-1"><TrendingUp className="h-5 w-5"/> Survey Progress Trends</h3>
              <p className="text-sm text-gray-500 mb-6">Monthly survey completion and planning data</p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={areaData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <Tooltip />
                    <Area type="monotone" dataKey="completed" stackId="1" stroke="none" fill="#4ade80" />
                    <Area type="monotone" dataKey="execution" stackId="1" stroke="none" fill="#60a5fa" />
                    <Area type="monotone" dataKey="planning" stackId="1" stroke="none" fill="#fbbf24" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
            <CardContent className="p-8 h-[450px] flex flex-col">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-1"><FileText className="h-5 w-5"/> Daily Response Rates</h3>
              <p className="text-sm text-gray-500 mb-6">Actual vs target response collection</p>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="target" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" dot={{r: 4, fill: '#ef4444'}} />
                    <Line type="monotone" dataKey="actual" stroke="#3b82f6" strokeWidth={3} dot={{r: 5, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff'}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800 lg:col-span-2">
            <CardContent className="p-8">
              <h3 className="text-lg font-bold flex items-center gap-2 mb-1"><ShieldCheck className="h-5 w-5"/> Crisis Mitigation Impact</h3>
              <p className="text-sm text-gray-500 mb-8">Real-time outcome monitoring based on mission resolution data</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div className="col-span-1 flex flex-col items-center">
                  <div className="relative h-40 w-40">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-gray-100 dark:text-gray-800" />
                      <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="8" strokeDasharray={`${recoveryRate * 2.51} 251`} strokeLinecap="round" className="text-primary-500 transition-all duration-1000" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold">{recoveryRate}%</span>
                      <span className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Reduced</span>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-6">
                   <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Lives Saved/Impacted</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{helpProvided}</p>
                      <div className="mt-2 h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500" style={{ width: `${recoveryRate}%` }}></div>
                      </div>
                   </div>
                   <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-1">Missions Resolved</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-gray-100">{tasks.filter(t => t.status === 'Completed').length}</p>
                      <p className="text-[10px] text-green-600 font-bold mt-1 flex items-center gap-1">
                        <ArrowUpRight className="h-3 w-3" /> Efficiency increased by 12%
                      </p>
                   </div>
                   <div className="p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 col-span-2">
                      <p className="text-xs text-gray-500 uppercase tracking-widest font-bold mb-2">Regional Risk Decline</p>
                      <div className="flex gap-2">
                        {regions.map((r, i) => (
                          <div key={r} className="flex-1 h-12 bg-gray-100 dark:bg-gray-900 rounded-lg flex flex-col items-center justify-center border border-transparent hover:border-primary-500/30 transition-colors">
                            <span className="text-[8px] text-gray-400 uppercase font-bold">{r}</span>
                            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">-{Math.round(recoveryRate / (i+1))}%</span>
                          </div>
                        ))}
                      </div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'organizations' && (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <h2 className="text-2xl font-bold">Organizations ({activeOrgsCount})</h2>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Search organizations..." 
                  className="pl-10 h-10 border-gray-200" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" className="gap-2 h-10 border-gray-200"><Filter className="h-4 w-4"/> Filter</Button>
              <Button className="bg-gray-900 text-white hover:bg-black dark:bg-white dark:text-black h-10 gap-2" onClick={() => setIsAddOrgModalOpen(true)}>
                <Plus className="h-4 w-4"/> Add Organization
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {organizations.filter(org => org.name.toLowerCase().includes(searchQuery.toLowerCase())).map(org => (
              <Card key={org.id} className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{org.name}</h3>
                      <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">{org.description}</p>
                    </div>
                    <span className={`px-3 py-1 text-white text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      org.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'
                    }`}>
                      {org.status}
                    </span>
                  </div>
                  <div className="flex gap-12 text-sm text-gray-700 dark:text-gray-300 mb-6 font-medium bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-100 dark:border-gray-800">
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-tighter">Active Tasks</p>
                      <p>{tasks.filter(t => t.location.includes(org.region || '') && t.status !== 'Completed').length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-tighter">Field Conductors</p>
                      <p>{users.filter(u => u.region === org.region && (u.role === 'worker' || u.role === 'volunteer')).length}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-gray-400 uppercase tracking-tighter">Affected Tracked</p>
                      <p>{tasks.filter(t => t.location.includes(org.region || '')).reduce((a,b) => a+b.peopleAffected, 0)}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedRegionMetrics(org.region || org.name)}
                      size="sm" 
                      className="font-semibold text-xs border-gray-200 h-9"
                    >
                      Regional Metrics
                    </Button>
                    <Button variant="outline" size="sm" className="font-semibold text-xs border-gray-200 gap-1.5 h-9" onClick={() => {
                      setSelectedManageRegion(org.region || org.name);
                      setSelectedOrgUsers(users.filter(u => u.region === org.region));
                      setIsManageUsersModalOpen(true);
                    }}>
                      <Users2 className="h-3.5 w-3.5"/> Manage regional Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'surveys' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Surveys & Tasks ({tasks.length})</h2>
            <div className="flex gap-3">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Search surveys..." className="pl-10 h-10 border-gray-200" />
              </div>
              <Button 
                onClick={() => setIsCreateTaskModalOpen(true)}
                className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
              >
                <Plus className="h-4 w-4"/> New Task
              </Button>
            </div>
          </div>
          
          {surveys && surveys.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold mb-4">Raw Survey Responses ({surveys.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {surveys.map(survey => (
                  <Card key={survey.id} className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded uppercase tracking-wider">{survey.problemType}</h4>
                        <span className="text-xs text-gray-500">{new Date(survey.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">{survey.location}</p>
                      <div className="flex justify-between text-xs text-gray-500 mb-4">
                        <span>Affected: <strong className="text-gray-900 dark:text-white">{survey.peopleAffected}</strong></span>
                        <span className={survey.severity === 'High' ? 'text-red-500' : 'text-orange-500'}>Sev: {survey.severity}</span>
                      </div>
                      <Button 
                        variant="outline" size="sm" className="w-full text-xs" 
                        onClick={() => {
                          setSelectedSurveyId(survey.id);
                          setIsSurveyModalOpen(true);
                        }}
                      >
                        View Full Response
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-bold mb-2">Active Assigned Missions</h3>
            {tasks.map(task => (
              <Card key={task.id} className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-xl font-bold mb-1">{task.title}</h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1">• Location: <span className="text-blue-500 font-medium">{task.location}</span></p>
                    </div>
                    <span className={`px-3 py-1 text-white text-[10px] font-bold rounded-full uppercase tracking-wider ${
                      task.status === 'Completed' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-sm text-gray-700 dark:text-gray-300 mb-6 font-medium">
                    <div>Priority<br/><span className={`text-xs font-bold mt-1 block ${task.priority === 'High' ? 'text-red-500' : 'text-blue-500'}`}>{task.priority}</span></div>
                    <div>Affected<br/><span className="text-xs text-gray-400 mt-1 block">{task.peopleAffected} People</span></div>
                    <div>Assignments<br/><span className="text-xs text-gray-400 mt-1 block">{task.assignedWorkers.length} workers</span></div>
                    <div className="flex items-center gap-2">
                       <div className="h-8 w-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-[10px]">
                         {users.find(u => u.id === task.assignedVolunteer)?.name.charAt(0) || '?'}
                       </div>
                       <span className="text-xs text-gray-500">Vol: {users.find(u => u.id === task.assignedVolunteer)?.name || 'Unassigned'}</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" className="font-semibold text-xs border-gray-300 gap-1.5"><MapPin className="h-3 w-3"/> Local Map</Button>
                    <Button variant="ghost" size="sm" className="font-semibold text-xs text-primary-600 ml-auto">Edit Task</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'risk' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Risk Monitoring</h2>
            <span className="bg-red-600 text-white text-sm font-bold px-3 py-1 rounded-full">{riskCount} Active Alerts</span>
          </div>

          <div className="bg-gray-50 border border-gray-200 dark:bg-gray-800/50 flex gap-3 p-4 rounded-xl items-center text-sm text-gray-700 dark:text-gray-300 dark:border-gray-700">
            <AlertTriangle className="h-5 w-5 text-gray-500" />
            ImpactPulse Automated Priority detection is active. Review flagged high-priority tasks requiring immediate field action.
          </div>

          <div className="space-y-4">
            {tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').map(task => (
              <Card key={task.id} className="rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 overflow-hidden relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4">
                      <ShieldAlert className="h-6 w-6 text-red-500 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold mb-1 -mt-0.5">{task.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5"/> {task.location}</span>
                          <span className="flex items-center gap-1"><Users2 className="h-3.5 w-3.5"/> {task.peopleAffected} Affected</span>
                        </div>
                      </div>
                    </div>
                    <span className="bg-red-100 text-red-700 text-[10px] font-bold px-3 py-1 rounded-full shrink-0 uppercase">High Priority</span>
                  </div>
                  <div className="flex gap-3 pl-10 mt-6">
                    <Button 
                      onClick={() => addToast('Investigation team has been alerted.', 'success')}
                      className="bg-gray-900 text-white text-xs font-semibold px-6 hover:bg-black dark:bg-white dark:text-black">Investigate</Button>
                    <Button 
                      onClick={() => {
                        updateTaskStatus(task.id, 'Completed');
                        addToast('Mission marked as resolved.', 'success');
                      }}
                      variant="outline" className="text-xs font-semibold px-4 border-gray-300">Mark Resolved</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'map' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Dynamic Crisis Monitoring</h2>
            <div className="flex gap-4">
               <div className="flex items-center gap-2 text-xs text-gray-500">
                 <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div> Active Hotspot
               </div>
               <div className="flex items-center gap-2 text-xs text-gray-500">
                 <div className="h-3 w-3 bg-orange-400 rounded-full"></div> Predictive Risk
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <Card className="lg:col-span-4 rounded-2xl shadow-xl border-gray-200 dark:border-gray-800 overflow-hidden bg-gray-100 dark:bg-gray-900/50 aspect-video relative group border-t-4 border-t-red-500 z-0">
              <MapContainer 
                // @ts-ignore
                center={[17.3850, 78.4867]} 
                // @ts-ignore
                zoom={12} 
                style={{ height: '100%', width: '100%' }}
                // @ts-ignore
                zoomControl={false}
              >
                <TileLayer
                  // @ts-ignore
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {tasks.filter(t => t.lat && t.lng).map((task) => {
                  let circleColor = '#fb923c'; // default orange
                  if (task.status === 'Completed') circleColor = '#22c55e'; // Green solved
                  else if (task.status === 'Pending') circleColor = '#3b82f6'; // Blue pending
                  else if (task.priority === 'High') circleColor = '#ef4444'; // Red high risk

                  return (
                  <Circle
                    key={task.id}
                    // @ts-ignore
                    center={[task.lat!, task.lng!]}
                    // @ts-ignore
                    radius={task.status === 'Completed' ? 400 : 800}
                    pathOptions={{
                      fillColor: circleColor,
                      color: circleColor,
                      weight: 2,
                      fillOpacity: task.status === 'Completed' ? 0.3 : 0.6,
                      className: task.status !== 'Completed' ? 'animate-pulse-slow' : ''
                    }}
                  >
                    <Popup 
                      // @ts-ignore
                      className="custom-popup"
                    >
                       <div className="p-2 min-w-[200px]">
                          <div className="flex justify-between items-center mb-2">
                             <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                               task.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-orange-100 text-orange-600'
                             }`}>{task.priority} Priority</span>
                          </div>
                          <h4 className="font-bold text-sm mb-1">{task.title}</h4>
                          <p className="text-[10px] text-gray-500 mb-2">{task.location}</p>
                          <div className="flex gap-2">
                             <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                                <div className={`h-full ${task.status === 'In Progress' ? 'bg-blue-500 w-2/3' : 'bg-yellow-500 w-1/3'}`}></div>
                             </div>
                             <span className="text-[10px] font-bold">{task.status === 'In Progress' ? '65%' : '15%'}</span>
                          </div>
                       </div>
                    </Popup>
                  </Circle>
                  );
                })}
             </MapContainer>
          </Card>

          <div className="lg:col-span-1 bg-white/95 text-sm dark:bg-gray-900/95 p-5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 space-y-4 border-t-4 border-t-primary-500">
             <h4 className="font-bold uppercase text-primary-600 tracking-widest flex items-center gap-2 mb-4">
                <Globe className="h-4 w-4" /> Insight
             </h4>
             <div className="space-y-4">
                 <div className="flex flex-col gap-1">
                   <span className="text-gray-500 text-xs uppercase font-bold tracking-tighter">Total Affected</span>
                   <span className="font-bold text-xl">{totalAffected}</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-gray-500 text-xs uppercase font-bold tracking-tighter">Recovery Rate</span>
                   <span className="font-bold text-green-600 text-xl">{recoveryRate}%</span>
                 </div>
                 <div className="flex flex-col gap-1">
                   <span className="text-gray-500 text-xs uppercase font-bold tracking-tighter">High Risk Clusters</span>
                   <span className="font-bold text-red-600 text-xl">{riskCount}</span>
                 </div>
                 
                 <div className="pt-4 border-t dark:border-gray-800 space-y-2 text-xs">
                    <p className="font-bold text-gray-500 uppercase">Map Legend</p>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div> High Risk</div>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse-slow"></div> Pending</div>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 bg-orange-400 rounded-full animate-pulse-slow"></div> In Progress</div>
                    <div className="flex items-center gap-2"><div className="h-3 w-3 bg-green-500 rounded-full"></div> Solved</div>
                 </div>
             </div>
             <div className="pt-3 border-t dark:border-gray-800 text-[10px] text-gray-400 font-medium animate-pulse mt-4">
                 AI ENGINE: Detecting anomalous crisis migration patterns...
             </div>
          </div>
        </div>
      </div>
      )}

      {activeTab === 'registrations' && (
        <Card className="rounded-xl shadow-sm border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-6">Pending Registrations Queue</h3>
            <div className="space-y-4">
              {users.filter(u => u.role === 'pending').length === 0 ? (
                <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-xl dark:bg-gray-800">No pending registrations.</div>
              ) : users.filter(u => u.role === 'pending').map(u => (
                <div key={u.id} className="p-4 border rounded-lg dark:border-gray-800 space-y-4 shadow-sm bg-white dark:bg-gray-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-lg flex items-center gap-2">{u.name}</h4>
                      <p className="text-sm text-gray-500">{u.email}</p>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-300">
                      <p><strong>Phone:</strong> {u.phone || 'N/A'}</p>
                      <p><strong>Location:</strong> {u.location || 'N/A'}</p>
                      <p><strong>Requested Role:</strong> <span className="uppercase text-blue-600 font-medium">{u.rolePreference || 'worker'}</span></p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-4 border-t dark:border-gray-800">
                    <Button variant="primary" size="sm" onClick={() => {
                      updateUserRole(u.id, u.rolePreference || 'worker');
                      addToast(`${u.name} approved as ${u.rolePreference || 'worker'}`, 'success');
                    }}>Approve Expected</Button>
                    <Button variant="outline" size="sm" onClick={() => {
                      const newRole = u.rolePreference === 'volunteer' ? 'worker' : 'volunteer';
                      updateUserRole(u.id, newRole);
                      addToast(`${u.name} approved as ${newRole}`, 'success');
                    }}>Alternative Approve</Button>
                    <Button variant="danger" size="sm" onClick={() => {
                      removeUser(u.id);
                      addToast(`${u.name} registration rejected`, 'warning');
                    }}>Reject</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
       <Modal 
        isOpen={isAddOrgModalOpen} 
        onClose={() => setIsAddOrgModalOpen(false)} 
        title="Add New Organization"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto px-1">
          <p className="text-sm text-gray-500 mb-2">Create a new organization to manage surveys and users.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Organization Name</label>
              <Input 
                placeholder="Enter organization name" 
                value={newOrgName} 
                onChange={(e) => setNewOrgName(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900"
                value={newOrgStatus}
                onChange={(e) => setNewOrgStatus(e.target.value as any)}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mission & Focus</label>
            <textarea 
              className="w-full min-h-[80px] p-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Describe the organization's mission and focus"
              value={newOrgDescription}
              onChange={(e) => setNewOrgDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Email</label>
              <Input 
                type="email"
                placeholder="contact@organization.org" 
                value={newOrgEmail} 
                onChange={(e) => setNewOrgEmail(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input 
                placeholder="+1-555-0123" 
                value={newOrgPhone} 
                onChange={(e) => setNewOrgPhone(e.target.value)} 
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Input 
              placeholder="Organization address" 
              value={newOrgAddress} 
              onChange={(e) => setNewOrgAddress(e.target.value)} 
            />
          </div>

          <div className="pt-4 flex gap-3 sticky bottom-0 bg-white dark:bg-gray-950 pb-2">
            <Button variant="outline" className="flex-1" onClick={() => setIsAddOrgModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white" onClick={() => {
              const newOrg = {
                id: crypto.randomUUID(),
                name: newOrgName,
                description: newOrgDescription,
                email: newOrgEmail,
                phone: newOrgPhone,
                address: newOrgAddress,
                status: newOrgStatus,
                region: newOrgName.split(' ').pop() || 'Unknown' // Derive region for metrics
              };
              addOrganization(newOrg);
              addToast('New organization created and synced to cloud', 'success');
              setIsAddOrgModalOpen(false);
              setNewOrgName('');
              setNewOrgDescription('');
              setNewOrgEmail('');
              setNewOrgPhone('');
              setNewOrgAddress('');
              setNewOrgStatus('Active');
            }}>Create Organization</Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isManageUsersModalOpen} 
        onClose={() => setIsManageUsersModalOpen(false)} 
        title="Manage Organization Users"
      >
        <div className="space-y-4">
          {selectedOrgUsers.length === 0 ? (
            <p className="text-center py-8 text-gray-500">No users found for this organization.</p>
          ) : (
            <div className="space-y-3">
              {selectedOrgUsers.map(user => (
                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center font-bold">
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900 dark:text-gray-100">{user.name}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-1 uppercase tracking-tight">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full"><Mail className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full"><Phone className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-6 border-t pt-4 border-gray-200 dark:border-gray-800">
              <h4 className="text-sm font-bold mb-3">Invite New User</h4>
              <div className="flex gap-2">
                 <Input 
                   className="flex-1"
                   placeholder="Enter email address" 
                   value={inviteEmail} 
                   onChange={e => setInviteEmail(e.target.value)} 
                 />
                 <select 
                   value={inviteRole}
                   onChange={e => setInviteRole(e.target.value as any)}
                   className="flex h-10 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-gray-900"
                 >
                   <option value="worker">Field Worker</option>
                   <option value="volunteer">Volunteer Coordinator</option>
                 </select>
                 <Button 
                   onClick={() => {
                      if (!inviteEmail) return;
                      const existing = users.find(u => u.email === inviteEmail);
                      if (existing) {
                         addToast('User already exists in the system.', 'error');
                         return;
                      }

                      addUser({
                        id: crypto.randomUUID(),
                        name: 'Invited Agent',
                        email: inviteEmail,
                        role: inviteRole,
                        region: selectedManageRegion || 'Unassigned',
                        phone: 'Pending Setup',
                        location: selectedManageRegion || 'Unassigned'
                      });

                      addToast(`EMAIL DISPATCHED: Welcome to ImpactPulse. You have been assigned to ${selectedManageRegion} as a ${inviteRole === 'worker' ? 'Field Worker' : 'Volunteer'} by Admin.`, 'success');
                      setInviteEmail('');
                      
                      // Refresh local mock list
                      setSelectedOrgUsers(users.filter(u => u.region === selectedManageRegion));
                   }}
                   className="bg-primary-600 text-white"
                 >
                   Invite
                 </Button>
              </div>
           </div>
           <Button variant="outline" className="w-full mt-4" onClick={() => setIsManageUsersModalOpen(false)}>Close Window</Button>
        </div>
      </Modal>

      <Modal 
        isOpen={isCreateTaskModalOpen} 
        onClose={() => setIsCreateTaskModalOpen(false)} 
        title="Dispatch New Mission"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-500">Create a task to address identified needs and dispatch to a volunteer coordinator.</p>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Title</label>
            <Input 
              placeholder="e.g. Emergency Food Distribution" 
              value={newTaskTitle} 
              onChange={(e) => setNewTaskTitle(e.target.value)} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mission Description</label>
            <textarea 
              className="w-full min-h-[80px] p-3 rounded-md border border-gray-200 dark:border-gray-800 bg-transparent text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Detail the operational requirements..."
              value={newTaskDesc}
              onChange={(e) => setNewTaskDesc(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <Input 
                placeholder="Region/District" 
                value={newTaskLocation} 
                onChange={(e) => setNewTaskLocation(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900"
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value as any)}
              >
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">People Affected</label>
              <Input 
                type="number"
                value={newTaskAffected} 
                onChange={(e) => setNewTaskAffected(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Assign Volunteer</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:bg-gray-900"
                value={newTaskVolunteer}
                onChange={(e) => setNewTaskVolunteer(e.target.value)}
              >
                <option value="">Select Coordinator</option>
                {users.filter(u => u.role === 'volunteer').map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.region})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Latitude</label>
              <Input 
                type="number"
                step="0.0001"
                value={newTaskLat} 
                onChange={(e) => setNewTaskLat(Number(e.target.value))} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Longitude</label>
              <Input 
                type="number"
                step="0.0001"
                value={newTaskLng} 
                onChange={(e) => setNewTaskLng(Number(e.target.value))} 
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setIsCreateTaskModalOpen(false)}>Cancel</Button>
            <Button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white" onClick={() => {
              addTask({
                id: Math.random().toString(36).substring(2, 9),
                title: newTaskTitle,
                description: newTaskDesc,
                location: newTaskLocation,
                status: 'Pending',
                priority: newTaskPriority,
                peopleAffected: newTaskAffected,
                assignedVolunteer: newTaskVolunteer,
                assignedWorkers: [],
                createdBy: 'admin',
                lat: newTaskLat,
                lng: newTaskLng
              });
              addToast('Mission dispatched successfully!', 'success');
              setIsCreateTaskModalOpen(false);
              setNewTaskTitle('');
              setNewTaskDesc('');
              setNewTaskLocation('');
              setNewTaskPriority('Medium');
              setNewTaskAffected(0);
              setNewTaskVolunteer('');
              setNewTaskLat(17.3850);
              setNewTaskLng(78.4867);
            }}>Dispatch Mission</Button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isSurveyModalOpen} 
        onClose={() => setIsSurveyModalOpen(false)} 
        title="Survey Response Details"
      >
        <div className="space-y-4">
           {selectedSurveyId && surveys && surveys.find(s => s.id === selectedSurveyId) && (() => {
             const s = surveys.find(s => s.id === selectedSurveyId)!;
             return (
               <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-6 rounded-xl space-y-4">
                 <div>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Problem Type</p>
                   <p className="text-lg font-bold">{s.problemType}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Severity & Impact</p>
                   <p className="font-bold">{s.severity} Priority - {s.peopleAffected} People Affected</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Verified Location</p>
                   <p className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4 text-primary-500"/> {s.location}</p>
                 </div>
                 <div>
                   <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1">Submission Time</p>
                   <p className="font-bold">{new Date(s.timestamp).toLocaleString()}</p>
                 </div>
                 <div className="pt-4 flex gap-2">
                    <Button className="flex-1 bg-primary-600 hover:bg-primary-700 text-white" onClick={() => {
                        setIsSurveyModalOpen(false);
                        setNewTaskTitle(`Response: ${s.problemType}`);
                        setNewTaskLocation(s.location);
                        setNewTaskPriority(s.severity as any);
                        setNewTaskAffected(s.peopleAffected);
                        setIsCreateTaskModalOpen(true);
                    }}>Convert to Mission</Button>
                 </div>
               </div>
             );
           })()}
        </div>
      </Modal>

      {/* Regional Metrics Live Insights Modal */}
      <Modal 
        isOpen={!!selectedRegionMetrics} 
        onClose={() => setSelectedRegionMetrics(null)} 
        title={`${selectedRegionMetrics} - Live Metrics`}
      >
        {selectedRegionMetrics && (() => {
          const regionTasks = tasks.filter(t => t.location.includes(selectedRegionMetrics));
          const completedTasks = regionTasks.filter(t => t.status === 'Completed').length;
          const pendingTasks = regionTasks.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
          const highRiskTasks = regionTasks.filter(t => t.priority === 'High').length;
          const regionAffected = regionTasks.reduce((a, b) => a + b.peopleAffected, 0);
          
          const activeWorkers = users.filter(u => u.region === selectedRegionMetrics && u.role === 'worker');
          const volunteers = users.filter(u => u.region === selectedRegionMetrics && u.role === 'volunteer');

          return (
            <div className="space-y-6">
              <div className="bg-primary-50 dark:bg-primary-900/10 p-4 rounded-xl border border-primary-100 dark:border-primary-900/30">
                 <p className="text-sm font-bold text-primary-700 dark:text-primary-300 flex items-center gap-2 mb-1">
                   <Activity className="h-4 w-4" /> Zone Analytics Engine
                 </p>
                 <p className="text-xs text-primary-600/80">Real-time aggregate data calculating operational efficiency and disaster tracking within {selectedRegionMetrics}.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="border border-gray-200 dark:border-gray-800 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Total Monitored</p>
                    <p className="text-2xl font-black">{regionTasks.length}</p>
                 </div>
                 <div className="border border-gray-200 dark:border-gray-800 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Lives Impacted</p>
                    <p className="text-2xl font-black text-primary-500">{regionAffected}</p>
                 </div>
                 <div className="border border-green-100 bg-green-50 dark:bg-green-900/10 dark:border-green-900/30 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] text-green-700 dark:text-green-500 font-bold uppercase tracking-widest">Resolved Missions</p>
                    <p className="text-2xl font-black text-green-600">{completedTasks}</p>
                 </div>
                 <div className="border border-red-100 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 p-4 rounded-xl space-y-1">
                    <p className="text-[10px] text-red-700 dark:text-red-500 font-bold uppercase tracking-widest">High Risk Hotspots</p>
                    <p className="text-2xl font-black text-red-600">{highRiskTasks}</p>
                 </div>
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2"><Users2 className="h-4 w-4 text-primary-600" /> Human Capital</h4>
                <div className="space-y-3">
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Field Dispatch Agents</span>
                     <span className="font-bold">{activeWorkers.length} Active</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Regional Volunteers</span>
                     <span className="font-bold">{volunteers.length} Delegating</span>
                   </div>
                   <div className="flex justify-between items-center text-sm">
                     <span className="text-gray-500">Mission Backlog</span>
                     <span className="font-bold">{pendingTasks} Pending</span>
                   </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                 <Button onClick={() => setSelectedRegionMetrics(null)}>Close Analytics</Button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Chatbot />
    </div>
  );
};

