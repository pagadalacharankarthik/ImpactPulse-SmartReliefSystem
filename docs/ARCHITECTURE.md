# 🏗️ ImpactPulse Technical Architecture

ImpactPulse uses a **Decentralized-Sync Architecture** designed for high-availability in disaster zones.

## 1. Data Flow Model
We employ a **"Local-First, Cloud-Synced"** strategy.

### The Ground Logic (Offline Hub)
- **Engine**: Powered by `idb` (IndexedDB).
- **Mechanism**: Every survey is asynchronously written to the browser's persistent storage before any network request is attempted.
- **Auto-Retry**: The system listens for the Window `online` event to trigger a background sync of all pending records.

### The Command Logic (Intelligence Hub)
- **Engine**: Google Cloud Firestore + Zustand.
- **Mechanism**: The Admin dashboard utilizes Firestore's real-time listeners. As soon as a field worker's phone finds a signal, the record "blinks" into the Admin's view without a page refresh.
- **Predictive Layer**: Client-side heuristic analysis on incoming survey text to categorize priority.

## 2. Security Architecture
- **Identity**: Firebase Authentication (Google SSO Provider).
- **RBAC (Role Based Access Control)**:
  - **Level 1 (Admin)**: Full CRUD on all collections.
  - **Level 2 (Volunteer)**: Can view tasks and delegate to workers.
  - **Level 3 (Worker/Pending)**: Restricted to profile onboarding and individual survey submissions.

## 3. Technology Integration
| Component | Implementation |
| :--- | :--- |
| **State Management** | Zustand with Middleware Persistence |
| **Offline DB** | IndexedDB via `idb` library |
| **Cloud DB** | Firestore with Multi-Role Security Rules |
| **Styling** | Utility-first CSS with Tailwind |
| **Icons** | SVG-based Lucide React icons |
