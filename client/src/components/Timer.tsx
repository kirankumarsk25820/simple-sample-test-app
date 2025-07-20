import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";

interface TimerProps {
  initialTime: number; // in seconds
  section: string;
  onTimeUp: () => void;
  isActive?: boolean;
}

export default function Timer({ initialTime, section, onTimeUp, isActive = true }: TimerProps) {
  const [timeRemaining, setTimeRemaining] = useState(initialTime);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, onTimeUp]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isWarning = timeRemaining <= 300; // 5 minutes warning
  const isCritical = timeRemaining <= 60; // 1 minute critical

  return (
    <div className="bg-white border border-slate-200 rounded-lg px-4 py-2">
      <div className="flex items-center space-x-2">
        {isCritical ? (
          <AlertTriangle className="h-5 w-5 text-red-500" />
        ) : (
          <Clock className={`h-5 w-5 ${isWarning ? 'text-orange-500' : 'text-slate-500'}`} />
        )}
        <span 
          className={`font-mono text-lg font-semibold ${
            isCritical ? 'text-red-600' : isWarning ? 'text-orange-600' : 'text-slate-700'
          }`}
        >
          {formatTime(timeRemaining)}
        </span>
      </div>
      <div className="text-xs text-slate-500 text-center">{section}</div>
    </div>
  );
}
