import { useState } from "react";
import { CameraFeed } from "./CameraFeed";
import { LayoutGrid, Grid3X3, Square, MonitorOff, WifiOff } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";

interface Camera {
  id: string;
  name: string;
  status: "online" | "offline" | "recording";
  streamUrl?: string;
}

export function CameraGrid() {
  const { activeServer } = useAuth();
  const [layout, setLayout] = useState<1 | 2 | 3>(3); // Columns: 1, 2, or 3
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const cameras: Camera[] = activeServer?.cameras || [];

  if (!activeServer) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#0a0a0a] text-zinc-500 p-8 text-center animate-in fade-in duration-500">
        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center mb-6 border border-zinc-800">
          <WifiOff size={40} className="opacity-20" />
        </div>
        <h2 className="text-xl font-bold text-zinc-300 mb-2">لا يوجد سيرفر نشط</h2>
        <p className="text-sm max-w-xs leading-relaxed opacity-60">يرجى اختيار سيرفر من القائمة العلوية أو إضافة سيرفر جديد من الإعدادات للبدء بعرض الكاميرات.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden p-2 md:p-4 relative">
      {/* Grid Controls */}
      <div className="flex justify-between items-center mb-4 px-2 shrink-0">
        <div className="flex flex-col">
          <h2 className="text-zinc-100 text-sm md:text-base font-bold uppercase tracking-tight flex items-center gap-2">
            <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
            {activeServer.name} ({cameras.length})
          </h2>
          <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">{activeServer.host}:{activeServer.port}</p>
        </div>

        <div className="flex gap-1 md:gap-2 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setLayout(1)}
            className={cn(
              "p-2 rounded-lg transition-all",
              layout === 1
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-zinc-500 hover:text-white",
            )}
            title="Single View"
          >
            <Square size={16} />
          </button>
          <button
            onClick={() => setLayout(2)}
            className={cn(
              "p-2 rounded-lg transition-all",
              layout === 2
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-zinc-500 hover:text-white",
            )}
            title="2x2 Grid"
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => setLayout(3)}
            className={cn(
              "p-2 rounded-lg transition-all",
              layout === 3
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                : "text-zinc-500 hover:text-white",
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
          "grid gap-2 md:gap-4 flex-1 auto-rows-[200px] md:auto-rows-[auto] overflow-y-auto pr-1 pb-4 scrollbar-hide",
          layout === 1 && "grid-cols-1",
          layout === 2 && "grid-cols-2",
          layout === 3 && "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        )}
      >
        {cameras.map((camera) => (
          <div
            key={camera.id}
            className="aspect-video cursor-pointer active:scale-[0.98] transition-all"
            onClick={() => setSelectedCamera(camera)}
          >
            <CameraFeed {...camera} />
          </div>
        ))}
        
        {cameras.length === 0 && (
          <div className="col-span-full h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-zinc-800 rounded-3xl opacity-50">
            <MonitorOff size={48} className="mb-4" />
            <p className="text-sm font-bold">لا توجد كاميرات لهذا السيرفر</p>
            <p className="text-xs mt-1">تأكد من تكوين الكاميرات من الإعدادات</p>
          </div>
        )}
      </div>

      {/* Fullscreen Overlay */}
      {selectedCamera && (
        <div className="absolute inset-0 z-50 bg-[#0a0a0a] flex flex-col animate-in fade-in zoom-in-95 duration-200">
          <div className="h-16 flex items-center justify-between px-6 border-b border-zinc-800 bg-[#0a0a0a]/80 backdrop-blur-md shrink-0">
            <div className="flex items-center gap-3">
               <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
               <h3 className="font-bold text-zinc-100 flex items-center gap-2">
                 {selectedCamera.name} <span className="text-[10px] text-zinc-500 uppercase font-mono tracking-tighter hidden sm:inline">{activeServer.name}</span>
               </h3>
            </div>
            <button
              onClick={() => setSelectedCamera(null)}
              className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-sm font-bold transition-all text-zinc-100 active:scale-95"
            >
              إغلاق العرض
            </button>
          </div>
          <div className="flex-1 p-4 md:p-12 lg:p-16 flex items-center justify-center overflow-hidden">
            <div className="w-full h-full max-w-5xl max-h-[70vh] aspect-video rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 bg-black flex items-center justify-center">
              <CameraFeed {...selectedCamera} />
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
