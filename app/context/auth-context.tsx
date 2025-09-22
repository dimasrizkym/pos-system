"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { createClient } from "@/lib/supabase/client";
import { hashPassword, verifyPassword } from "@/lib/auth-utils";

export type UserRole = "owner" | "kasir";

export interface User {
  id: string;
  username: string;
  role: UserRole;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    password: string,
    role: UserRole
  ) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [supabase, setSupabase] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const client = createClient();
      setSupabase(client);
      console.log("[v0] Supabase client initialized successfully");
    } catch (error) {
      console.error("[v0] Failed to initialize Supabase client:", error);
    }

    // Check if user is logged in from localStorage
    try {
      const savedUser = localStorage.getItem("pos-user");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (e) {
      console.error("Failed to parse user from local storage", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    if (!supabase) {
      console.error("[v0] Supabase client not initialized");
      return false;
    }

    try {
      console.log("[v0] Attempting login for username:", username);

      const { data: userData, error } = await supabase
        .from("pos_users")
        .select("*")
        .eq("username", username.toLowerCase())
        .maybeSingle();

      if (error) {
        console.error("[v0] Database error:", error);
        return false;
      }

      if (!userData) {
        console.log("[v0] User not found for username:", username);
        return false;
      }

      console.log("[v0] User found, verifying password...");
      console.log("[v0] Input password:", password);
      console.log("[v0] Stored hash:", userData.password);
      console.log(
        "[v0] Hash starts with $2a$10$:",
        userData.password.startsWith("$2a$10$")
      );

      const isPasswordValid = await verifyPassword(password, userData.password);

      console.log("[v0] Password verification result:", isPasswordValid);

      if (isPasswordValid) {
        const user: User = {
          id: userData.id,
          username: userData.username,
          role: userData.role as UserRole,
          name: userData.role === "owner" ? "Owner Admin" : "Kasir",
        };

        console.log("[v0] Login successful for user:", user.username);
        setUser(user);
        localStorage.setItem("pos-user", JSON.stringify(user));
        return true;
      }

      console.log("[v0] Password verification failed");
      return false;
    } catch (error) {
      console.error("[v0] Login error:", error);
      return false;
    }
  };

  const register = async (
    username: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    if (!supabase) return false;

    try {
      const hashedPassword = await hashPassword(password);

      const { data, error } = await supabase
        .from("pos_users")
        .insert([{ username, password: hashedPassword, role }])
        .select()
        .single();

      if (error) {
        console.error("[v0] Registration error:", error);
        return false;
      }

      console.log("[v0] Registration successful for user:", data.username);
      return true;
    } catch (error) {
      console.error("[v0] Registration error:", error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("pos-user");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
