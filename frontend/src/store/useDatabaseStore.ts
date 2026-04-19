import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, isFirebaseEnabled } from '../config/firebase';
import { collection, addDoc, setDoc, doc, updateDoc, getDocs } from 'firebase/firestore';

export type UserRole = 'admin' | 'volunteer' | 'worker' | 'pending';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';
export type Priority = 'High' | 'Medium' | 'Low';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  region?: string;
  phone?: string;
  location?: string;
  rolePreference?: 'volunteer' | 'worker' | 'admin';
  password?: string;
}

export interface TaskRecord {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: Priority;
  status: TaskStatus;
  createdBy: string; // admin ID
  assignedVolunteer?: string; // volunteer ID
  assignedWorkers: string[]; // array of worker IDs
  peopleAffected: number;
  lat?: number;
  lng?: number;
  logs?: string[];
}

export interface SurveyRecord {
  id: string;
  problemType: string;
  severity: Priority;
  peopleAffected: number;
  location: string;
  timestamp: number;
}

export interface OrganizationRecord {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  status: 'Active' | 'Inactive';
  region?: string;
}

interface DatabaseState {
  users: UserRecord[];
  tasks: TaskRecord[];
  addUser: (user: UserRecord) => void;
  updateUser: (user: UserRecord) => void;
  removeUser: (id: string) => void;
  updateUserRole: (id: string, role: UserRole) => void;
  addTask: (task: TaskRecord) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;
  updateTaskImpact: (id: string, affected: number) => void;
  assignVolunteerToTask: (taskId: string, volunteerId: string) => void;
  assignWorkerToTask: (taskId: string, workerId: string) => void;
  surveys: SurveyRecord[];
  addSurvey: (survey: SurveyRecord) => void;
  organizations: OrganizationRecord[];
  addOrganization: (org: OrganizationRecord) => void;
  initializeCloudSync: () => Promise<void>;
}

// Initial mock data simulating remote DB
const initialUsers: UserRecord[] = [
  { id: 'admin1', name: 'Global NGO Admin', email: 'admin@ngo.org', role: 'admin' },
  { id: 'vol1', name: 'Sarah Volunteer', email: 'sarah@ngo.org', role: 'volunteer', region: 'North' },
  { id: 'vol2', name: 'John Volunteer', email: 'john@ngo.org', role: 'volunteer', region: 'South' },
  { id: 'worker1', name: 'Mike Worker', email: 'mike@ngo.org', role: 'worker', region: 'North' },
  { id: 'worker2', name: 'Anna Worker', email: 'anna@ngo.org', role: 'worker', region: 'South' },
  { id: 'pending1', name: 'New Request', email: 'request@ngo.org', role: 'pending', phone: '1234567890', location: 'East District', rolePreference: 'worker' }
];

const initialOrgs: OrganizationRecord[] = [
  { id: 'org1', name: 'ImpactPulse - North Chapter', description: 'Regional command for North district operational response.', email: 'north@impactpulse.org', phone: '+1-555-0100', address: 'North Hub, Block A', status: 'Active', region: 'North' },
  { id: 'org2', name: 'ImpactPulse - South Chapter', description: 'Regional command for South district operational response.', email: 'south@impactpulse.org', phone: '+1-555-0200', address: 'South Hub, Level 2', status: 'Active', region: 'South' },
  { id: 'org3', name: 'ImpactPulse - East Chapter', description: 'Regional command for East district operational response.', email: 'east@impactpulse.org', phone: '+1-555-0300', address: 'East Annex', status: 'Active', region: 'East' }
];

const initialTasks: TaskRecord[] = [
  { 
    id: 't1', title: 'Food Relief North District', description: 'Deliver 500 meal packets', 
    location: 'North District', priority: 'High', status: 'Pending', 
    createdBy: 'admin1', assignedVolunteer: 'vol1', assignedWorkers: [], peopleAffected: 500,
    lat: 17.4486, lng: 78.3908 
  },
  { 
    id: 't2', title: 'Medical Supplies South', description: 'Basic first aid and medics', 
    location: 'South District', priority: 'Medium', status: 'In Progress', 
    createdBy: 'admin1', assignedVolunteer: 'vol2', assignedWorkers: ['worker2'], peopleAffected: 120,
    lat: 17.3605, lng: 78.4744
  }
];

export const useDatabaseStore = create<DatabaseState>()(
  persist(
    (set) => ({
      users: initialUsers,
      tasks: initialTasks,
      organizations: initialOrgs,
      surveys: [],
      removeUser: (id) => set((state) => {
        if (isFirebaseEnabled() && db) {
          // Note: In a real app we might not want to delete from cloud if it's a demo
          // but for consistency we follow the local state
        }
        return { users: state.users.filter(u => u.id !== id) };
      }),

      updateUserRole: (id, role) => set((state) => {
        if (isFirebaseEnabled() && db) {
          updateDoc(doc(db, 'users', id), { role }).catch(console.error);
        }
        return { users: state.users.map(u => u.id === id ? { ...u, role } : u) };
      }),

      addSurvey: (survey) => set((state) => {
        if (isFirebaseEnabled() && db) {
          // Firestore addDoc generates its own ID, so we strip ours for the cloud
          const { id: _, ...cloudData } = survey;
          addDoc(collection(db, 'surveys'), cloudData).catch(console.error);
        }
        return { surveys: [...state.surveys, survey] };
      }),

      addUser: (user) => set((state) => {
        if (isFirebaseEnabled() && db) {
          // Cleanup undefined fields before Firestore sync
          const cleanUser = Object.fromEntries(
            Object.entries(user).filter(([_, v]) => v !== undefined)
          );
          setDoc(doc(db, 'users', user.id), cleanUser).catch(console.error);
        }
        return { users: [...state.users, user] };
      }),

      updateUser: (updatedUser) => set((state) => {
        if (isFirebaseEnabled() && db) {
          setDoc(doc(db, 'users', updatedUser.id), updatedUser).catch(console.error);
        }
        return { users: state.users.map(u => u.id === updatedUser.id ? updatedUser : u) };
      }),

      addTask: (task) => {
        const lowerDesc = task.description.toLowerCase();
        let detectedPriority: Priority = task.priority;
        if (lowerDesc.includes('emergency') || lowerDesc.includes('critical') || lowerDesc.includes('severe')) {
          detectedPriority = 'High';
        }
        
        const finalTask = { ...task, priority: detectedPriority };
        if (isFirebaseEnabled() && db) {
          const cleanTask = Object.fromEntries(
            Object.entries(finalTask).filter(([_, v]) => v !== undefined)
          );
          setDoc(doc(db, 'tasks', finalTask.id), cleanTask).catch(console.error);
        }
        set((state) => ({ tasks: [...state.tasks, finalTask] }));
      },

      updateTaskStatus: (id, status) => set((state) => {
        if (isFirebaseEnabled() && db) {
          updateDoc(doc(db, 'tasks', id), { status }).catch(console.error);
        }
        return { tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t) };
      }),

      updateTaskImpact: (id, affected) => set((state) => {
        if (isFirebaseEnabled() && db) {
          updateDoc(doc(db, 'tasks', id), { peopleAffected: affected }).catch(console.error);
        }
        return { tasks: state.tasks.map(t => t.id === id ? { ...t, peopleAffected: affected } : t) };
      }),

      assignVolunteerToTask: (taskId, volunteerId) => set((state) => {
        if (isFirebaseEnabled() && db) {
          updateDoc(doc(db, 'tasks', taskId), { assignedVolunteer: volunteerId }).catch(console.error);
        }
        return { tasks: state.tasks.map(t => t.id === taskId ? { ...t, assignedVolunteer: volunteerId } : t) };
      }),

      assignWorkerToTask: (taskId, workerId) => set((state) => {
        const updatedTasks = state.tasks.map(t => t.id === taskId ? { ...t, assignedWorkers: [...new Set([...t.assignedWorkers, workerId])] } : t);
        if (isFirebaseEnabled() && db) {
          const task = updatedTasks.find(t => t.id === taskId);
          if (task) {
            updateDoc(doc(db, 'tasks', taskId), { assignedWorkers: task.assignedWorkers }).catch(console.error);
          }
        }
        return { tasks: updatedTasks };
      }),

      addOrganization: (org) => set((state) => {
        if (isFirebaseEnabled() && db) {
          const cleanOrg = Object.fromEntries(
            Object.entries(org).filter(([_, v]) => v !== undefined)
          );
          setDoc(doc(db, 'organizations', org.id), cleanOrg).catch(console.error);
        }
        return { organizations: [...state.organizations, org] };
      }),

      initializeCloudSync: async () => {
        if (!isFirebaseEnabled() || !db) return;
        try {
          const taskSnap = await getDocs(collection(db, 'tasks'));
          const cloudTasks = taskSnap.docs.map(d => ({ ...d.data(), id: d.id } as TaskRecord));
          
          const surveySnap = await getDocs(collection(db, 'surveys'));
          const cloudSurveys = surveySnap.docs.map(d => ({ ...d.data(), id: d.id } as SurveyRecord));

          const userSnap = await getDocs(collection(db, 'users'));
          const cloudUsers = userSnap.docs.map(d => ({ ...d.data(), id: d.id } as UserRecord));

          const orgSnap = await getDocs(collection(db, 'organizations'));
          const cloudOrgs = orgSnap.docs.map(d => ({ ...d.data(), id: d.id } as OrganizationRecord));

          set((state) => {
            // Merge logic: Start with initial demo users, then overlay cloud users
            const mergedUsersMap = new Map();
            initialUsers.forEach(u => mergedUsersMap.set(u.email, u));
            cloudUsers.forEach(u => mergedUsersMap.set(u.email, u));
            
            return {
              tasks: cloudTasks.length > 0 ? cloudTasks : state.tasks,
              surveys: cloudSurveys.length > 0 ? cloudSurveys : state.surveys,
              organizations: cloudOrgs.length > 0 ? cloudOrgs : state.organizations,
              users: Array.from(mergedUsersMap.values())
            };
          });
        } catch (err) {
          console.error("Failed to sync with cloud, using local cache:", err);
        }
      }
    }),
    { name: 'impactpulse-db' }
  )
);
