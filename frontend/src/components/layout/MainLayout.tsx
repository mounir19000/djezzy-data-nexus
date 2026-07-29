import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAppStore } from '../../store/useAppStore';
import { useSocket } from '../../hooks/useSocket';
import SimulationControl from '../common/SimulationControl';

const MainLayout = () => {
  const { isSidebarOpen } = useAppStore((state: any) => state);

  // Initialize real-time telemetry connection
  useSocket();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {isSidebarOpen && <Sidebar />}
      
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        <Topbar />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
      
      <SimulationControl />
    </div>
  );
};

export default MainLayout;
