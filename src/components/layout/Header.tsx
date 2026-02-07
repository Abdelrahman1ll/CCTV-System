import { Wifi, Router, Bell, User } from "lucide-react";

export function Header() {
  return (
    <header className="h-16 bg-[#0a0a0a] border-b border-zinc-800 flex items-center justify-between px-4 md:px-6 shrink-0 z-10">
      {/* Left: Title */}
      <div className="flex flex-col">
        <h1 className="text-base md:text-lg font-semibold text-zinc-100 leading-tight">
          Live Dashboard
        </h1>
        <p className="text-[10px] md:text-xs text-zinc-500 hidden xs:block">
          Status: <span className="text-green-500">Normal</span>
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* System Status - Hidden on very small screens */}
        <div className="hidden sm:flex items-center gap-3 px-3 md:px-4 py-1.5 bg-zinc-900 rounded-full border border-zinc-800">
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-zinc-400">
            <Wifi size={14} className="text-green-500" />
            <span className="hidden md:inline">Network: Stable</span>
          </div>
          <div className="w-px h-3 bg-zinc-700 hidden md:block"></div>
          <div className="flex items-center gap-2 text-[10px] md:text-xs text-zinc-400">
            <Router size={14} className="text-blue-500" />
            <span className="hidden md:inline">DVR-01: Online</span>
          </div>
        </div>

        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-zinc-800 text-zinc-400 transition-colors">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#0a0a0a]"></span>
        </button>

        {/* Profile */}
        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 cursor-pointer hover:border-zinc-500 shrink-0">
          <User size={16} className="text-zinc-400" />
        </div>
      </div>
    </header>
  );
}
