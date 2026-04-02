import { useState, useEffect } from "react";
import { Header } from "./components/layout/Header";
import { BottomNav } from "./components/layout/BottomNav";
import { CameraGrid } from "./components/cameras/CameraGrid";
import { Sidebar } from "./components/layout/Sidebar";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LoginPage } from "./pages/LoginPage";

import { SettingsPage } from "./pages/SettingsPage";
import { PlaybackPage } from "./pages/PlaybackPage";

function Dashboard() {
  const [collapsed, setCollapsed] = useState(true);
  const [currentView, setCurrentView] = useState('live'); // 'live' or 'settings'
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('live');
    }
  }, [isAuthenticated]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="flex h-screen w-full bg-[#0a0a0a] text-zinc-100 overflow-hidden relative">
      {/* Sidebar - Desktop Only */}
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} currentView={currentView} setCurrentView={setCurrentView} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        <Header />

        <main className="flex-1 overflow-hidden relative flex flex-col pb-16 lg:pb-0 bg-[#0a0a0a]">
          {currentView === 'live' && <CameraGrid />}
          {currentView === 'playback' && <PlaybackPage />}
          {currentView === 'settings' && <SettingsPage />}
        </main>

        {/* Bottom Nav - Mobile Only */}
        <BottomNav currentView={currentView} setCurrentView={setCurrentView} />
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Dashboard />
    </AuthProvider>
  );
}

export default App;
