import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import { profileApi } from '../../lib/endpoints/profile';

const PsychologistLayout = () => {
  const [psy, setPsy] = useState(null);

  useEffect(() => {
    profileApi.me()
      .then((res) => setPsy(res.data.data))
      .catch(() => {});
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col md:flex-row max-w-[1536px] mx-auto w-full px-4 sm:px-6 py-6 md:py-10 gap-8">
      {/* Background accents (optional if body has it, but adds to the layout) */}
      <div 
        className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgb(var(--accent-2)), transparent 70%)' }}
      />
      <div 
        className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgb(var(--brand-blue)), transparent 70%)' }}
      />

      <Sidebar
        psyName={psy?.user?.name}
        avatarUrl={psy?.avatarUrl}
      />
      
      <div className="flex-1 min-w-0 pb-24 md:pb-0 z-10 relative">
        <Outlet />
      </div>
      
      <BottomNav />
    </div>
  );
};

export default PsychologistLayout;
