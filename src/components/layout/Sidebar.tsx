import {
  LayoutDashboard,
  Video,
  HardDrive,
  Settings,
  LogOut,
  Menu,
  Bell,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useAuth } from "../../contexts/AuthContext";

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { logout } = useAuth();
  const navItems = [
    { icon: LayoutDashboard, label: "Live View", active: true },
    { icon: Video, label: "Playback", active: false },
    { icon: HardDrive, label: "Storage", active: false },
    { icon: Bell, label: "Events", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {!collapsed && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 z-30"
          onClick={() => setCollapsed(true)}
        />
      )}

      <div
        className={cn(
          "hidden lg:flex h-screen bg-[#111111] border-r border-zinc-800 flex-col transition-all duration-300 ease-in-out z-40 overflow-x-hidden",
          collapsed ? "w-16" : "w-64 px-2",
        )}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800 shrink-0">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="font-bold text-white uppercase italic">C</span>
              </div>
              <span className="font-bold text-zinc-100 text-lg tracking-tight">
                CCTV DASH
              </span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors lg:block"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 py-4 px-1 space-y-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
          {navItems.map((item) => (
            <button
              key={item.label}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium group relative",
                item.active
                  ? "bg-blue-600/10 text-blue-500"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100",
              )}
            >
              <item.icon
                size={20}
                className={cn(item.active && "text-blue-500")}
              />
              {(!collapsed ||
                (collapsed &&
                  typeof window !== "undefined" &&
                  window.innerWidth < 1024)) && (
                <span className="transition-opacity duration-200">
                  {item.label}
                </span>
              )}

              {/* Tooltip for collapsed state (Desktop only) */}
              {collapsed && (
                <div className="hidden lg:block absolute left-14 bg-zinc-800 text-zinc-200 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                  {item.label}
                </div>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 shrink-0">
          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500/80 hover:bg-red-500/10 transition-colors text-sm font-medium",
              collapsed && "lg:justify-center lg:px-0",
            )}
          >
            <LogOut size={20} />
            {(!collapsed ||
              (collapsed &&
                typeof window !== "undefined" &&
                window.innerWidth < 1024)) && <span>Logout</span>}
          </button>
        </div>
      </div>
    </>
  );
}
