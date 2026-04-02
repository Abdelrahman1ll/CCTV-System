import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { encryptData, decryptData } from "../utils/crypto";

export interface ServerConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  code: string;
  token?: string;
  cameras: any[];
  isConnected: boolean;
}

export interface DVRConfig {
  ip: string;
  user: string;
  pass: string;
  channels: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  servers: ServerConfig[];
  activeServerId: string | null;
  activeServer: ServerConfig | null;
  dvrConfig: DVRConfig | null;
  loginViaQR: (host: string, port: number, code: string, name?: string) => Promise<void>;
  directConnect: (name: string, url: string, wsPort: number) => Promise<void>;
  setupDvr: (config: DVRConfig) => Promise<void>;
  logout: () => void;
  switchServer: (id: string) => void;
  removeServer: (id: string) => void;
  removeDvr: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_SERVERS_KEY = "cctv_servers_data_secure";
const ACTIVE_SERVER_KEY = "cctv_active_server_id_secure";
const COOKIE_EXPIRE_DAYS = 36500; // 100 years

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [servers, setServers] = useState<ServerConfig[]>([]);
  const [activeServerId, setActiveServerId] = useState<string | null>(null);
  const [dvrConfig, setDvrConfig] = useState<DVRConfig | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeServer = servers.find(s => s.id === activeServerId) || null;
  const isAuthenticated = !!activeServer?.token || !!dvrConfig;

  useEffect(() => {
    // 1. Check for encrypted cookies
    const cookieServers = Cookies.get(AUTH_SERVERS_KEY);
    const cookieActiveId = Cookies.get(ACTIVE_SERVER_KEY);
    
    let initialServers: ServerConfig[] = [];
    let initialActiveId: string | null = null;

    if (cookieServers) {
      initialServers = decryptData(cookieServers) || [];
      initialActiveId = decryptData(cookieActiveId || "") || null;
    } 
    // 2. Migration from old localStorage (if exists)
    else {
      const oldServers = localStorage.getItem("cctv_servers_data");
      const oldActiveId = localStorage.getItem("cctv_active_server_id");
      if (oldServers) {
        try {
          initialServers = JSON.parse(oldServers);
          initialActiveId = oldActiveId;
          // Clean up old storage after migration
          localStorage.removeItem("cctv_servers_data");
          localStorage.removeItem("cctv_active_server_id");
          console.log("Migration from localStorage complete.");
        } catch (e) {
          console.error("Migration failed", e);
        }
      }
    }

    setServers(initialServers);
    if (initialActiveId && initialServers.find(s => s.id === initialActiveId)) {
      setActiveServerId(initialActiveId);
    } else if (initialServers.length > 0) {
      setActiveServerId(initialServers[0].id);
    }
    
    // 3. Load DVR Config
    const storedDvr = localStorage.getItem("cctv_dvr_config");
    if (storedDvr) {
      try {
        const config = JSON.parse(storedDvr);
        setDvrConfig(config);
        // Trigger background connection
        setupDvr(config);
      } catch (e) {}
    }
    
    // Artificial delay to ensure the UI feels stable
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // Save data encrypted to cookies
      if (servers.length > 0) {
        Cookies.set(AUTH_SERVERS_KEY, encryptData(servers), { expires: COOKIE_EXPIRE_DAYS, sameSite: 'strict', secure: true });
      } else {
        Cookies.remove(AUTH_SERVERS_KEY);
      }

      if (activeServerId) {
        Cookies.set(ACTIVE_SERVER_KEY, encryptData(activeServerId), { expires: COOKIE_EXPIRE_DAYS, sameSite: 'strict', secure: true });
      } else {
        Cookies.remove(ACTIVE_SERVER_KEY);
      }
    }
  }, [servers, activeServerId, isLoading]);

  const loginViaQR = async (host: string, port: number, code: string, name?: string) => {
    try {
      // Clean host (remove http:// if present)
      const cleanHost = host.replace(/^https?:\/\//, '').replace(/\/$/, '');
      const apiUrl = `http://${cleanHost}:${port}/api/auth`;
      
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const serverId = `server_${Date.now()}`;
        const newServer: ServerConfig = {
          id: serverId,
          name: name || `Server ${cleanHost}`,
          host: cleanHost,
          port: port,
          code: code,
          token: result.token,
          cameras: result.cameras,
          isConnected: true
        };

        setServers(prev => {
          // Avoid duplicate servers by host/port
          const filtered = prev.filter(s => !(s.host === cleanHost && s.port === port));
          return [...filtered, newServer];
        });
        setActiveServerId(serverId);
      } else {
        throw new Error(result.message || "رمز غير صالح (Unauthorized)");
      }
    } catch (err: any) {
      console.error("Login verification failed:", err);
      if (err.message === "Failed to fetch") {
        throw new Error("فشل الاتصال بالخادم. يرجى التأكد من أن الرابط والمنفذ صحيحان.");
      }
      throw new Error(err.message || "فشل الاتصال بالسيرفر");
    }
  };

  const setupDvr = async (config: DVRConfig) => {
    try {
      const response = await fetch("http://localhost:3000/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!response.ok) throw new Error("Failed to initialize DVR engine");
      const result = await response.json();

      if (result.success) {
        setDvrConfig(config);
        localStorage.setItem("cctv_dvr_config", JSON.stringify(config));

        const serverId = "dvr_main";
        const newServer: ServerConfig = {
          id: serverId,
          name: "نظام المراقبة المركزي",
          host: config.ip,
          port: 554,
          code: "dvr",
          token: "dvr_token",
          cameras: result.cameras.map((cam: any) => ({
            ...cam,
            streamUrl: `ws://localhost:${cam.wsPort}`
          })),
          isConnected: true
        };

        setServers([newServer]);
        setActiveServerId(serverId);
      }
    } catch (err: any) {
      console.error("DVR setup failed:", err);
      throw err;
    }
  };

  const removeDvr = () => {
    setDvrConfig(null);
    localStorage.removeItem("cctv_dvr_config");
    removeServer("dvr_main");
  };

  const directConnect = async (name: string, url: string, wsPort: number) => {
    try {
      const serverHost = "localhost"; // Default for local use
      const serverPort = 3000; // Default backend port
      
      const apiUrl = `http://${serverHost}:${serverPort}/api/connect?name=${encodeURIComponent(name)}&url=${encodeURIComponent(url)}&wsPort=${wsPort}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error("فشل الاتصال بـ Direct Connect API");

      const result = await response.json();

      if (result.success) {
        const serverId = `direct_${Date.now()}`;
        const newServer: ServerConfig = {
          id: serverId,
          name: name || "Manual Camera",
          host: serverHost,
          port: serverPort,
          code: "manual",
          token: "manual_token_" + Date.now(),
          cameras: [
            {
              id: result.camera.id,
              name: result.camera.name,
              status: "online",
              wsPort: result.camera.wsPort,
              streamUrl: `ws://${serverHost}:${result.camera.wsPort}`
            }
          ],
          isConnected: true
        };

        setServers([newServer]);
        setActiveServerId(serverId);
      }
    } catch (err: any) {
      console.error("Direct connect failed:", err);
      throw new Error(err.message || "فشل الاتصال المباشر");
    }
  };

  const switchServer = (id: string) => {
    if (servers.find(s => s.id === id)) {
      setActiveServerId(id);
    }
  };

  const removeServer = (id: string) => {
    setServers(prev => {
      const filtered = prev.filter(s => s.id !== id);
      if (activeServerId === id) {
        setActiveServerId(filtered.length > 0 ? filtered[0].id : null);
      }
      return filtered;
    });
  };

  const logout = () => {
    setServers([]);
    setActiveServerId(null);
    setDvrConfig(null);
    localStorage.removeItem("cctv_dvr_config");
    Cookies.remove(AUTH_SERVERS_KEY);
    Cookies.remove(ACTIVE_SERVER_KEY);
  };

  return (
    <AuthContext.Provider
      value={{ 
        isAuthenticated, 
        isLoading, 
        servers, 
        activeServerId, 
        activeServer,
        dvrConfig,
        loginViaQR, 
        directConnect,
        setupDvr,
        logout,
        switchServer,
        removeServer,
        removeDvr
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
