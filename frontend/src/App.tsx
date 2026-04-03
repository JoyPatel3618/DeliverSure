import { useState } from 'react';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';

function App() {
  const [riderId, setRiderId] = useState<number | null>(() => {
    const saved = localStorage.getItem('deliverSure_riderId');
    return saved ? parseInt(saved) : null;
  });

  const handleOnboardingComplete = (id: number) => {
    setRiderId(id);
    localStorage.setItem('deliverSure_riderId', id.toString());
  };

  const handleLogout = () => {
    setRiderId(null);
    localStorage.removeItem('deliverSure_riderId');
  };

  return (
    <div className="bg-[#fcfcfd] text-slate-900 selection:bg-blue-500/10">
      {!riderId ? (
        <Onboarding onComplete={handleOnboardingComplete} />
      ) : (
        <Dashboard riderId={riderId} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
