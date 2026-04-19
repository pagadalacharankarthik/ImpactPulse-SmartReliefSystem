import { openDB } from 'idb';
import type { DBSchema, IDBPDatabase } from 'idb';
import { useDatabaseStore } from '../store/useDatabaseStore';

export interface SurveyData {
  id: string;
  location: { lat: number; lng: number } | string;
  problemType: string;
  severity: 'High' | 'Medium' | 'Low';
  peopleAffected: number;
  timestamp: number;
  synced: boolean;
}

interface ImpactPulseDB extends DBSchema {
  surveys: {
    key: string;
    value: SurveyData;
    indexes: { 'by-sync': 'synced' };
  };
}

class OfflineSyncService {
  private dbPromise: Promise<IDBPDatabase<ImpactPulseDB>>;

  constructor() {
    this.dbPromise = openDB<ImpactPulseDB>('impactpulse-surveys-v2', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('surveys')) {
          const store = db.createObjectStore('surveys', { keyPath: 'id' });
          store.createIndex('by-sync', 'synced');
        }
      },
    });
  }

  async saveSurvey(survey: Omit<SurveyData, 'synced'>): Promise<void> {
    const db = await this.dbPromise;
    await db.put('surveys', { ...survey, synced: false });
    
    // Attempt sync if online
    if (navigator.onLine) {
      this.syncPendingSurveys();
    }
  }

  async getPendingSurveys(): Promise<SurveyData[]> {
    const db = await this.dbPromise;
    // @ts-expect-error type inference bypass
    return await db.getAllFromIndex('surveys', 'by-sync', false);
  }

  async markAsSynced(id: string): Promise<void> {
    const db = await this.dbPromise;
    const survey = await db.get('surveys', id);
    if (survey) {
      survey.synced = true;
      await db.put('surveys', survey);
    }
  }

  async syncPendingSurveys() {
    console.log('Attempting to sync pending surveys...');
    const pending = await this.getPendingSurveys();
    if (pending.length === 0) return;

    for (const survey of pending) {
      try {
        // Mocking API call to Firebase
        // In a real app we would call: await addDoc(collection(db, 'surveys'), survey);
        console.log('Syncing survey to cloud:', survey);
        
        // Simulating network request
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Convert survey to task in global store (Reflecting in Admin Dashboard)
        const { addTask } = useDatabaseStore.getState();
        addTask({
          id: survey.id,
          title: `Field Report: ${survey.problemType}`,
          description: `Integrated ground intelligence. Priority detected based on severity: ${survey.severity}.`,
          location: typeof survey.location === 'string' ? survey.location : `${survey.location.lat}, ${survey.location.lng}`,
          priority: survey.severity,
          status: 'Pending',
          createdBy: 'system_sync',
          assignedWorkers: [],
          peopleAffected: survey.peopleAffected
        });
        
        await this.markAsSynced(survey.id);
        console.log(`Survey ${survey.id} synced and task created.`);
      } catch (error) {
        console.error('Failed to sync survey:', error);
      }
    }
  }

  setupEventListeners() {
    window.addEventListener('online', () => {
      console.log('App is online. Triggering sync...');
      this.syncPendingSurveys();
    });
  }
}

export const syncService = new OfflineSyncService();
