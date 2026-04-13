"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  uid: string;
  fullName: string;
  email: string;
  isPlatformAdmin: boolean;
}

interface Business {
  uid: string;
  name: string;
}

interface AuthContext {
  user: User | null;
  business: Business | null;
  isLoading: boolean;
  login: (token: string, user: User, business: Business) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContext | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");
    const savedBusiness = localStorage.getItem("business");

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      if (savedBusiness) setBusiness(JSON.parse(savedBusiness));
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((token: string, user: User, business: Business) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("business", JSON.stringify(business));
    setUser(user);
    setBusiness(business);
    router.push("/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("business");
    setUser(null);
    setBusiness(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext value={{ user, business, isLoading, login, logout }}>
      {children}
    </AuthContext>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
