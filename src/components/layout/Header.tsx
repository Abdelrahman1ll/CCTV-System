import { Router, ChevronDown, Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";

export function Header() {
  const { servers, activeServer, switchServer } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <header className="h-16 bg-[#0a0a0a] border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-50">
      {/* Left: Title & Server Switcher */}
      <div className="flex items-center gap-4">
        <div className="flex flex-col">
          <h1 className="text-base md:text-lg font-bold text-zinc-100 leading-tight">
            Dashboard
          </h1>
        </div>

        <div className="h-6 w-px bg-zinc-800 mx-2 hidden sm:block"></div>

        {/* Server Selector */}
        <div className="relative">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all group"
          >
            <div className={`w-2 h-2 rounded-full ${activeServer?.isConnected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-zinc-700'}`}></div>
            <span className="text-xs font-bold text-zinc-300 group-hover:text-white truncate max-w-[100px] md:max-w-[150px]">
              {activeServer?.name || "لا يوجد سيرفر"}
            </span>
            <ChevronDown size={14} className={`text-zinc-500 transition-transform ${isDropdownOpen ? 'rotate-180 text-blue-500' : ''}`} />
          </button>

          {isDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-[-1]" 
                onClick={() => setIsDropdownOpen(false)}
              ></div>
              <div className="absolute top-full left-0 mt-2 w-56 bg-[#111] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200" dir="rtl">
                <div className="p-2 border-b border-zinc-800 bg-zinc-900/50">
                  <span className="text-[10px] uppercase font-bold text-zinc-500 px-2 tracking-widest">اختر السيرفر</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {servers.map((server) => (
                    <button
                      key={server.id}
                      onClick={() => {
                        switchServer(server.id);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-zinc-800 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                         <div className={`w-2 h-2 rounded-full ${server.isConnected ? 'bg-green-500' : 'bg-zinc-700'}`}></div>
                         <div className="text-right">
                           <p className={`text-sm font-bold ${server.id === activeServer?.id ? 'text-blue-500' : 'text-zinc-300 group-hover:text-white'}`}>{server.name}</p>
                           <p className="text-[10px] text-zinc-500 font-mono tracking-tighter">{server.host}:{server.port}</p>
                         </div>
                      </div>
                      {server.id === activeServer?.id && <Check size={16} className="text-blue-500" />}
                    </button>
                  ))}
                  {servers.length === 0 && (
                    <div className="p-4 text-center text-xs text-zinc-600">لا توجد سيرفرات مضافة</div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* System Status - Hidden on very small screens */}
        <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 bg-zinc-900 border border-zinc-800 rounded-full" dir="ltr">
           <div className="flex items-center gap-2 text-[10px] text-zinc-400">
             <Router size={14} className="text-blue-600" />
             <span className="font-bold tracking-tight text-zinc-300">
               {activeServer ? `IP: ${activeServer.host}` : "No Server"}
             </span>
           </div>
        </div>

      </div>
    </header>
  );
}
