"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "";

interface User {
  user_id: number;
  username: string;
  email_id: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  employee_code: string;
  role_id: number;
  department: string;
  designation: string;
  user_status: string;
  last_login: string;
  account_locked: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
  ) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("crm_user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch {
        localStorage.removeItem("crm_user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (
    username: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await fetch(`${BASE_URL}/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        return {
          success: false,
          message: json.message || "Invalid credentials. Please try again.",
        };
      }

      const { user: apiUser, tokens } = json.data;

      setUser(apiUser);
      setIsAuthenticated(true);

      localStorage.setItem("crm_user", JSON.stringify(apiUser));
      localStorage.setItem("crm_access_token", tokens.accessToken);
      localStorage.setItem("crm_refresh_token", tokens.refreshToken);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "Unable to connect to server. Please try again later.",
      };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("crm_user");
    localStorage.removeItem("crm_access_token");
    localStorage.removeItem("crm_refresh_token");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
