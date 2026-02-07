import { LayoutDashboard, Video, Bell, Settings, LogOut } from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";

export function BottomNav() {
  const { logout } = useAuth();
  const navItems = [
    { icon: LayoutDashboard, label: "Live", active: true },
    { icon: Video, label: "Playback", active: false },
    { icon: Bell, label: "Events", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-[#111111] border-t border-zinc-800 flex items-center justify-around px-2 z-40 lg:hidden">
      {navItems.map((item) => (
        <button
          key={item.label}
          className={cn(
            "flex flex-col items-center justify-center gap-1 min-w-[64px] transition-colors",
            item.active ? "text-blue-500" : "text-zinc-500",
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
