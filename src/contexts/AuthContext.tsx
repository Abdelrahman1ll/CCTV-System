import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  loginViaQR: (data: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_COOKIE_NAME = "cctv_session_token";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const token = Cookies.get(AUTH_COOKIE_NAME);
    if (token) {
      setIsAuthenticated(true);
    }
    // Artificial delay to ensure the UI feels stable
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const loginViaQR = (data: string) => {
    // Logic to update config based on QR data could go here
    console.log("QR Sync Data:", data);
    // Set cookie for 100 years
    Cookies.set(AUTH_COOKIE_NAME, "valid_session_token", { expires: 36500 });
    setIsAuthenticated(true);
  };

  const logout = () => {
    Cookies.remove(AUTH_COOKIE_NAME);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, loginViaQR, logout }}
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
