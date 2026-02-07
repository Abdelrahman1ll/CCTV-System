import { useState } from "react";
import { CameraFeed } from "./CameraFeed";
import { LayoutGrid, Grid3X3, Square } from "lucide-react";
import { cn } from "../../utils/cn";

interface Camera {
  id: string;
  name: string;
  status: "online" | "offline" | "recording";
  streamUrl?: string;
}

const CAMERAS: Camera[] = [
  {
    id: "1",
    name: "DVR Main Stream",
    status: "recording",
    streamUrl: "ws://localhost:9991",
  },
  {
    id: "2",
    name: "Backup View",
    status: "online",
    streamUrl: "ws://localhost:9992",
  },
  { id: "3", name: "Lobby", status: "online" },
  { id: "4", name: "Server Room", status: "online" },
  { id: "5", name: "Office", status: "online" },
  { id: "6", name: "Exit", status: "offline" },
];

export function CameraGrid() {
  const [layout, setLayout] = useState<1 | 2 | 3>(3); // Columns: 1, 2, or 3
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden p-2 md:p-4">
      {/* Grid Controls */}
      <div className="flex justify-between items-center mb-4 px-2 shrink-0">
        <h2 className="text-zinc-400 text-xs md:text-sm font-semibold uppercase tracking-wider">
          Feeds ({CAMERAS.length})
        </h2>

        <div className="flex gap-1 md:gap-2 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setLayout(1)}
            className={cn(
              "p-1.5 rounded transition-all",
              layout === 1
                ? "bg-blue-600 text-white shadow"
                : "text-zinc-400 hover:text-white",
            )}
            title="Single View"
          >
            <Square size={16} />
          </button>
          <button
            onClick={() => setLayout(2)}
            className={cn(
              "p-1.5 rounded transition-all",
              layout === 2
                ? "bg-blue-600 text-white shadow"
                : "text-zinc-400 hover:text-white",
            )}
            title="2x2 Grid"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setLayout(3)}
            className={cn(
              "p-1.5 rounded transition-all",
              layout === 3
                ? "bg-blue-600 text-white shadow"
                : "text-zinc-400 hover:text-white",
            )}
            title="3x3 Grid"
          >
            <Grid3X3 size={16} />
          </button>
        </div>
      </div>

      {/* Grid Content */}
      <div
        className={cn(
          "grid gap-2 md:gap-4 flex-1 auto-rows-fr overflow-y-auto pr-1 pb-1 scrollbar-hide",
          layout === 1 && "grid-cols-1",
          layout === 2 && "grid-cols-2",
          layout === 3 && "grid-cols-2 md:grid-cols-3 lg:grid-cols-3",
        )}
      >
        {CAMERAS.map((camera) => (
          <div
            key={camera.id}
            className="min-h-[120px] md:min-h-[160px] aspect-video cursor-pointer active:scale-[0.98] transition-all"
            onClick={() => setSelectedCamera(camera)}
          >
            <CameraFeed {...camera} />
          </div>
        ))}
      </div>

      {/* Fullscreen Overlay */}
      {selectedCamera && (
        <div className="fixed inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-in fade-in zoom-in duration-200">
          <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 bg-[#111111]">
            <h3 className="font-semibold text-zinc-100">
              {selectedCamera.name} - Live
            </h3>
            <button
              onClick={() => setSelectedCamera(null)}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm transition-colors text-zinc-100"
            >
              Close
            </button>
          </div>
          <div className="flex-1 p-4 md:p-8 flex items-center justify-center bg-black">
            <div className="w-full max-w-6xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-zinc-800">
              <CameraFeed {...selectedCamera} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
