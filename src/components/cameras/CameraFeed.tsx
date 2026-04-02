import { useState, useEffect, useRef } from "react";
import { Maximize2, MoreVertical, Aperture, VideoOff, X } from "lucide-react";
import { cn } from "../../utils/cn";

interface CameraFeedProps {
  name: string;
  status: "online" | "offline" | "recording";
  streamUrl?: string; // WebSocket URL (e.g. ws://localhost:9991)
}

declare global {
  interface Window {
    JSMpeg: any;
  }
}

export function CameraFeed({ name, status, streamUrl }: CameraFeedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [time, setTime] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<any>(null);

  // Mock live timestamp
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSnapshot = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL("image/jpeg", 0.9);
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `snapshot_${name.replace(/\s+/g, '_')}_${new Date().getTime()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const feedRef = useRef<HTMLDivElement>(null);

  const handleMaximizeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (feedRef.current) {
      if (!document.fullscreenElement) {
        feedRef.current.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowInfo(prev => !prev);
  };

  // Initialize JSMpeg Player
  useEffect(() => {
    if (
      status !== "offline" &&
      streamUrl &&
      canvasRef.current &&
      window.JSMpeg
    ) {
      try {
        playerRef.current = new window.JSMpeg.Player(streamUrl, {
          canvas: canvasRef.current,
          autoplay: true,
          audio: false,
          loop: false,
          disableGl: true, // Forces Canvas2D to allow snapshot capturing
          onSourceEstablished: () => { console.log(`Stream connected: ${name}`); setIsPlaying(true); },
          onSourceCompleted: () => { console.log(`Stream ended: ${name}`); setIsPlaying(false); },
        });
      } catch (err) {
        console.error(`JSMpeg error for ${name}:`, err);
      }

      return () => {
        if (playerRef.current) {
          try {
            // JSMpeg's destroy can sometimes throw if the socket is already dead
            playerRef.current.destroy();
          } catch (e) {
            console.warn(`Error destroying JSMpeg for ${name}`, e);
          }
          playerRef.current = null;
        }
      };
    }
  }, [status, streamUrl, name]);

  return (
    <div
      ref={feedRef}
      className="relative w-full h-full bg-black rounded-xl overflow-hidden group shadow-lg border border-zinc-900"
    >
      {/* Feed Content */}
      {status === "offline" ? (
        <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 bg-zinc-900/50">
          <VideoOff size={48} className="mb-2 opacity-50" />
          <span className="text-sm font-medium">Signal Lost</span>
        </div>
      ) : (
        <div className="w-full h-full relative">
          <canvas ref={canvasRef} className="w-full h-full object-contain" />
          {!streamUrl && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm">
              <span className="text-xs text-zinc-400">
                Waiting for stream...
              </span>
            </div>
          )}
        </div>
      )}

      {/* Overlays */}
      <div className="absolute inset-x-0 top-0 p-3 flex justify-between items-start bg-linear-to-b from-black/70 to-transparent pointer-events-none">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "w-2.5 h-2.5 rounded-full",
              status === "offline" ? "bg-zinc-600" :
              isPlaying ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
            )}
          />
          <span className="text-xs font-semibold text-white/90 tracking-wide drop-shadow-md">
            {name}
          </span>
        </div>
        <div className="text-xs font-mono text-white/80 drop-shadow-md">
          {time.toLocaleTimeString()}
        </div>
      </div>

      {/* Hover Controls */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 p-3 flex justify-between items-center bg-linear-to-t from-black/80 to-transparent transition-transform duration-300",
          showInfo ? "hidden" : "translate-y-0 lg:translate-y-full group-hover:translate-y-0",
        )}
      >
        <button 
          onClick={handleSnapshot}
          title="التقاط صورة"
          className="p-1.5 rounded-lg bg-white/10 hover:bg-blue-600/80 text-white transition-colors cursor-pointer relative z-10"
        >
          <Aperture size={16} />
        </button>

        <div className="flex gap-2 relative z-10">
          <button 
            onClick={handleMaximizeClick}
            title="تكبير"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-blue-600/80 text-white transition-colors cursor-pointer"
          >
            <Maximize2 size={16} />
          </button>
          <button 
            onClick={handleInfoClick}
            title="معلومات"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-zinc-600/80 text-white transition-colors cursor-pointer"
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
      
      {/* Info Overlay Panel */}
      {showInfo && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-20 flex flex-col p-4 lg:p-6 text-white text-xs gap-3 animate-in fade-in zoom-in-95 duration-200" dir="rtl">
          <div className="flex justify-between items-center border-b border-white/10 pb-3 mb-1">
            <span className="font-bold text-sm text-blue-400">معلومات الكاميرا</span>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowInfo(false); }}
              className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="font-semibold text-zinc-400">الاسم</span>
            <span className="text-zinc-100">{name}</span>
          </div>
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="font-semibold text-zinc-400">الحالة</span>
            <span className={status === "online" ? "text-green-400 font-bold" : status === "offline" ? "text-red-400 font-bold" : "text-amber-400 font-bold"}>
              {status === "online" ? "متصل (Online)" : status === "offline" ? "غير متصل (Offline)" : "نشط"}
            </span>
          </div>
          {streamUrl && (
            <div className="flex justify-between border-b border-white/5 pb-2">
              <span className="font-semibold text-zinc-400">المنفذ (Port)</span>
              <span className="text-zinc-100 font-mono tracking-widest">{new URL(streamUrl).port}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-white/5 pb-2">
            <span className="font-semibold text-zinc-400">تكنولوجيا المعالجة</span>
            <span className="text-zinc-100 font-mono">JSMpeg Canvas2D</span>
          </div>
        </div>
      )}
    </div>
  );
}
