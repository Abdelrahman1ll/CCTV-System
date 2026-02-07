import { useState, useEffect, useRef } from "react";
import { Maximize2, MoreVertical, Aperture, VideoOff } from "lucide-react";
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
  const [isHovered, setIsHovered] = useState(false);
  const [time, setTime] = useState(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const playerRef = useRef<any>(null);

  // Mock live timestamp
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
          onSourceEstablished: () => console.log(`Stream connected: ${name}`),
          onSourceCompleted: () => console.log(`Stream ended: ${name}`),
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
      className="relative w-full h-full bg-black rounded-xl overflow-hidden group shadow-lg border border-zinc-900"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
              "w-2.5 h-2.5 rounded-full animate-pulse",
              status === "online"
                ? "bg-green-500"
                : status === "recording"
                  ? "bg-red-500"
                  : "bg-gray-500",
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
          isHovered ? "translate-y-0" : "translate-y-full",
        )}
      >
        <button className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
          <Aperture size={16} />
        </button>

        <div className="flex gap-2">
          <button className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <Maximize2 size={16} />
          </button>
          <button className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors">
            <MoreVertical size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
