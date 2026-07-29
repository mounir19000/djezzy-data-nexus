import { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { API_BASE_URL } from '../../lib/api';

interface SimulationStatus {
  isRunning: boolean;
  cursor: number;
  totalRows: number;
}

const SimulationControl = () => {
  const [status, setStatus] = useState<SimulationStatus | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const fetchStatus = async () => {
    try {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`${API_BASE_URL}/api/simulation/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to fetch simulation status:', error);
    }
  };

  useEffect(() => {
    fetchStatus();
    const intervalId = setInterval(fetchStatus, 2000); // Poll every 2s
    return () => clearInterval(intervalId);
  }, []);

  const handleAction = async (action: 'pause' | 'resume' | 'reset') => {
    try {
      const token = localStorage.getItem('djezzy_token');
      const res = await fetch(`${API_BASE_URL}/api/simulation/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
      }
    } catch (error) {
      console.error(`Failed to ${action} simulation:`, error);
    }
  };

  if (!status) return null;

  const progressPercentage = status.totalRows > 0 
    ? ((status.cursor / status.totalRows) * 100).toFixed(1) 
    : 0;

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-2 hover:opacity-100 hover:translate-y-0'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-bg-surface border border-border-subtle rounded-xl shadow-lg overflow-hidden flex flex-col w-64 backdrop-blur-md bg-bg-surface/90">
        <div className="px-4 py-2 bg-bg-secondary/50 border-b border-border-subtle flex justify-between items-center">
          <span className="text-xs font-mono text-on-surface-variant uppercase tracking-wider font-semibold">
            Telemetry Sim
          </span>
          <span className={`w-2 h-2 rounded-full ${status.isRunning ? 'bg-status-success animate-pulse' : 'bg-status-warning'}`}></span>
        </div>
        
        <div className="p-4 flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm font-mono text-on-surface">
            <span>{status.cursor} / {status.totalRows}</span>
            <span className="text-primary">{progressPercentage}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 w-full bg-bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${status.isRunning ? 'bg-primary' : 'bg-status-warning'}`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <div className="flex justify-between mt-1">
            <button
              onClick={() => handleAction('reset')}
              className="p-2 rounded-lg bg-bg-secondary text-on-surface hover:bg-bg-surface hover:text-primary transition-colors border border-transparent hover:border-border-subtle"
              title="Reset Simulation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            
            {status.isRunning ? (
              <button
                onClick={() => handleAction('pause')}
                className="p-2 px-4 rounded-lg bg-status-warning/10 text-status-warning hover:bg-status-warning/20 transition-colors flex items-center gap-2 border border-status-warning/20"
              >
                <Pause className="w-4 h-4" />
                <span className="text-sm font-medium">Pause</span>
              </button>
            ) : (
              <button
                onClick={() => handleAction('resume')}
                className="p-2 px-4 rounded-lg bg-status-success/10 text-status-success hover:bg-status-success/20 transition-colors flex items-center gap-2 border border-status-success/20"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm font-medium">Play</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulationControl;
