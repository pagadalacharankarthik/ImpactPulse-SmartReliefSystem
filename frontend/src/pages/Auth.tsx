import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useDatabaseStore } from '../store/useDatabaseStore';
import type { UserRecord } from '../store/useDatabaseStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LogIn, UserPlus } from 'lucide-react';
import { auth, googleProvider, isFirebaseEnabled } from '../config/firebase';
import { signInWithPopup } from 'firebase/auth';

export const Auth = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { users, addUser } = useDatabaseStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('demo123');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [rolePreference, setRolePreference] = useState<'volunteer' | 'worker'>('worker');
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [googleUser, setGoogleUser] = useState<any>(null);

  const handleDemoSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      // Security: Check if they have a custom password, otherwise use demo123
      const validPassword = existing.password || 'demo123';
      
      if (password !== validPassword) {
        alert("Invalid security credential for this account.");
        return;
      }

      login(existing);
      navigate('/dashboard');
    } else {
      alert(`Demo account not found for "${email}". Try: admin@ngo.org`);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isFirebaseEnabled() || !auth || !googleProvider) {
      // Demo Fallback for local development
      const mockEmail = prompt("Enter a demo email (admin@ngo.org, sarah@ngo.org, mike@ngo.org):");
      if (mockEmail) {
        const existing = users.find(u => u.email === mockEmail);
        if (existing) {
          login(existing);
          navigate('/dashboard');
        } else {
          alert("Demo user not found.");
        }
      }
      return;
    }

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const userEmail = result.user.email;
      if (!userEmail) return;

      const existingUser = users.find(u => u.email === userEmail);

      if (existingUser) {
        login(existingUser);
        navigate('/dashboard');
      } else {
        // Start Onboarding
        setGoogleUser(result.user);
        setName(result.user.displayName || '');
        setEmail(userEmail);
        setIsOnboarding(true);
      }
    } catch (err) {
      console.error("Google Auth failed:", err);
      alert("Google Sign-In failed. Please try again.");
    }
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleUser || !email) return;

    const newUser: UserRecord = {
      id: googleUser.uid,
      name,
      email,
      role: 'pending',
      phone,
      location,
      rolePreference,
      password // Store the secondary password for hybrid access
    };

    addUser(newUser);
    login(newUser);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen pt-24 px-4 flex items-start justify-center bg-gray-50 dark:bg-background">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-primary-500 animate-in slide-in-from-bottom-8 duration-500">
        <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-bold flex flex-col items-center gap-3">
            <div className="h-12 w-12 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center">
              {isOnboarding ? <UserPlus className="h-6 w-6" /> : <LogIn className="h-6 w-6" />}
            </div>
            {isOnboarding ? 'Complete Your Profile' : 'Welcome to ImpactPulse'}
          </CardTitle>
          <p className="text-gray-500 text-sm">
            {isOnboarding ? 'Provide NGO deployment details to continue' : 'Sign in with your Google account to access' }
          </p>
        </CardHeader>
        <CardContent>
          {!isOnboarding ? (
            <div className="space-y-6">
              <Button 
                onClick={handleGoogleSignIn}
                className="w-full h-12 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-3 font-semibold shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="h-5 w-5" />
                Sign in with Google
              </Button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
                <span className="relative bg-white px-3 text-xs text-gray-400 font-bold tracking-widest uppercase flex justify-center">OR DEMO ACCESS</span>
              </div>

              <form className="space-y-4" onSubmit={handleDemoSignIn}>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Demo Email</label>
                  <Input 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="admin@ngo.org" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Password</label>
                  <Input 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="demo123" 
                  />
                </div>
                <Button className="w-full h-11 bg-primary-600 hover:bg-primary-700 text-white font-bold" type="submit">
                  Enter Command Center
                </Button>
                <p className="text-[10px] text-center text-gray-400">CREDENTIALS: admin@ngo.org / demo123</p>
              </form>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleOnboardingSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-400">Email (Verified)</label>
                <Input disabled value={email} className="bg-gray-50 opacity-70" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input required value={name} onChange={e => setName(e.target.value)} placeholder="Enter your full name" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <Input required type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 890" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Assigned Region / Location</label>
                <Input required value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. North District" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Create Login Password</label>
                <Input 
                  required 
                  type="password" 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Set a password for manual login" 
                />
                <p className="text-[10px] text-gray-400">This allows you to access your account via Email/Password later.</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role Preference</label>
                <select
                  required
                  value={rolePreference} onChange={e => setRolePreference(e.target.value as 'volunteer' | 'worker')}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 dark:bg-gray-900"
                >
                  <option value="worker">Field Worker (Submits surveys & executes tasks)</option>
                  <option value="volunteer">Volunteer (Delegates ground tasks)</option>
                </select>
                <p className="text-xs text-gray-500">Note: Your application will require Admin approval before accessing your dashboard.</p>
              </div>
              <Button className="w-full h-11 text-base mt-2 bg-primary-600 hover:bg-primary-700 text-white" type="submit">
                Submit & Request Access
              </Button>
            </form>
          )}

          {!isOnboarding && (
            <div className="mt-8 text-center text-xs text-gray-400">
               By signing in, you agree to the NGO Data Security Protocol and Privacy Terms.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
