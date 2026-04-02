import { LayoutDashboard, Video, Settings, LogOut } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: string) => void;
}

export function BottomNav({ currentView, setCurrentView }: BottomNavProps) {
  const { logout } = useAuth();
  const navItems = [
    { id: 'live', icon: LayoutDashboard, label: "Live", active: currentView === 'live' },
    { id: 'playback', icon: Video, label: "Playback", active: currentView === 'playback' },

    { id: 'settings', icon: Settings, label: "Settings", active: currentView === 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#111111] border-t border-zinc-800 flex items-center justify-around px-2 z-40 lg:hidden">
      {navItems.map((item) => (
        <button
          key={item.label}
          onClick={() => {
            if (item.id === 'live' || item.id === 'settings' || item.id === 'playback') {
              setCurrentView(item.id);
            }
          }}
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors",
            item.active ? "text-blue-500" : "text-zinc-500 hover:text-white",
          )}
        >
          <item.icon size={20} />
          <span className="text-[10px] font-medium tracking-wide uppercase">
            {item.label}
          </span>
        </button>
      ))}
      <button
        onClick={logout}
        className="flex flex-col items-center justify-center gap-1 min-w-[64px] text-red-500/80 transition-colors"
      >
        <LogOut size={20} />
        <span className="text-[10px] font-medium tracking-wide uppercase">
          Logout
        </span>
      </button>
    </nav>
  );
}
