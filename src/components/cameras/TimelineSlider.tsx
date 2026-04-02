import { useEffect, useState, useRef } from 'react';
import { cn } from "../../utils/cn";

interface TimelineSliderProps {
  time: string; 
  setTime: (time: string) => void;
  onSeek: (newTime: string) => void;
  disabled?: boolean;
}

const timeToSeconds = (t: string) => {
  if (!t) return 0;
  const parts = t.split(':');
  const h = parseInt(parts[0] || '0', 10);
  const m = parseInt(parts[1] || '0', 10);
  // Optional seconds
  const s = parseInt(parts[2] || '0', 10);
  return h * 3600 + m * 60 + s;
};

const secondsToTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
};

export function TimelineSlider({ time, setTime, onSeek, disabled }: TimelineSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [internalSeconds, setInternalSeconds] = useState(timeToSeconds(time));
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isDragging) {
      setInternalSeconds(timeToSeconds(time));
    }
  }, [time, isDragging]);

  const calculateTimeFromEvent = (clientX: number) => {
    if (!timelineRef.current) return 0;
    const rect = timelineRef.current.getBoundingClientRect();
    let x = clientX - rect.left;
    x = Math.max(0, Math.min(x, rect.width));
    const percent = x / rect.width;
    return Math.floor(percent * 86399); // 0 to 86399 seconds
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (disabled) return;
    const target = e.target as HTMLElement;
    target.setPointerCapture(e.pointerId);
    setIsDragging(true);
    const secs = calculateTimeFromEvent(e.clientX);
    setInternalSeconds(secs);
    setTime(secondsToTime(secs)); // Update visually immediately
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    const secs = calculateTimeFromEvent(e.clientX);
    setInternalSeconds(secs);
    setTime(secondsToTime(secs)); // Live UI update in drawer
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging || disabled) return;
    const target = e.target as HTMLElement;
    target.releasePointerCapture(e.pointerId);
    setIsDragging(false);
    
    const secs = calculateTimeFromEvent(e.clientX);
    const timeStr = secondsToTime(secs);
    setInternalSeconds(secs);
    setTime(timeStr);
    onSeek(timeStr); // Trigger the network fetch
  };

  return (
    <div className="w-full flex flex-col gap-2 p-4 bg-zinc-900/50 border border-zinc-800 rounded-2xl shadow-xl mt-4 max-w-5xl">
      <div className="flex justify-between items-end mb-1 px-1">
        <span className="text-[10px] sm:text-xs font-bold text-zinc-400">00:00</span>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs text-zinc-500 font-medium">الوقت المحدد</span>
          <span className="text-sm font-mono font-bold text-blue-400 bg-blue-950/50 px-3 py-1 rounded-lg border border-blue-900/50 shadow-inner">
            {secondsToTime(internalSeconds)}
          </span>
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-zinc-400">23:59</span>
      </div>

      <div 
        ref={timelineRef}
        className={cn(
          "relative w-full h-8 bg-[#0a0a0a] rounded-lg cursor-pointer overflow-hidden border border-zinc-800/80 shadow-inner touch-none",
          disabled ? "opacity-50 cursor-not-allowed" : "hover:border-zinc-700"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Ticks for 24 hours */}
        {Array.from({ length: 25 }).map((_, i) => (
          <div 
            key={i} 
            className="absolute top-0 bottom-0 border-l border-zinc-800 flex flex-col justify-end pointer-events-none" 
            style={{ left: `${(i / 24) * 100}%` }}
          >
            {/* Show every 3 hours natively or every hour depending on screen size, simplify to 2 hours for mobile */}
            {i % 2 === 0 && i !== 0 && i !== 24 && (
              <span className="text-[9px] text-zinc-600 font-mono -ml-2 mb-1 drop-shadow-md">{i}</span>
            )}
          </div>
        ))}
        
        {/* Progress Background */}
        <div 
          className="absolute top-0 bottom-0 left-0 bg-blue-600/20 pointer-events-none transition-all duration-75" 
          style={{ width: `${(internalSeconds / 86400) * 100}%` }} 
        />
        
        {/* Scrubber / Playhead */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.8)] pointer-events-none transition-all duration-75 z-10" 
          style={{ left: `${(internalSeconds / 86400) * 100}%` }} 
        >
          {/* Playhead Handle Triangle */}
          <div className="absolute -top-1 -left-1.5 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-blue-500"></div>
        </div>
      </div>
      
      <p className="text-center text-[10px] text-zinc-500 mt-2">
        اسحب الشريط المؤشر يميناً ويساراً للانتقال السريع عبر ساعات اليوم المُسجل
      </p>
    </div>
  );
}
