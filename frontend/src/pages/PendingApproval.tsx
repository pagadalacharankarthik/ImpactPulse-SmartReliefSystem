import { Clock, ShieldAlert } from 'lucide-react';

export const PendingApproval = () => {
  return (
    <div className="min-h-screen pt-24 px-4 flex flex-col items-center bg-gray-50 dark:bg-background text-center animate-in fade-in zoom-in duration-500">
      <div className="max-w-md space-y-6 flex flex-col items-center">
        <div className="h-24 w-24 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-full flex items-center justify-center shadow-sm">
          <Clock className="h-12 w-12" />
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-50">
          Account Under Review
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
          Your application has been received successfully. For security and verification purposes, an administrator must approve your account before you can access the dashboard.
        </p>

        <div className="mt-8 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 flex flex-col items-center gap-3 w-full">
          <ShieldAlert className="h-6 w-6 text-blue-600" />
          <p className="text-sm text-blue-800 dark:text-blue-300">
            Please check back later or contact your NGO coordinator if you require immediate emergency access.
          </p>
        </div>
      </div>
    </div>
  );
};
