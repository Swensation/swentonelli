"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, googleProvider } from "@/lib/firebaseClient";
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut } from "firebase/auth";

export const DAD_EMAIL = "aswens@gmail.com";
const STORAGE_KEY = "scouty_auth_user";

export interface AuthUser {
  email: string;
  name?: string;
  photoURL?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAdmin: boolean;
  isLoading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsDad: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Check local storage cache for instant hydration
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch {
      // ignore
    }

    // 2. Listen to live Firebase Auth state if available
    let unsubscribe = () => {};
    if (auth) {
      unsubscribe = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser && fbUser.email) {
          const authUser: AuthUser = {
            email: fbUser.email.toLowerCase(),
            name: fbUser.displayName || undefined,
            photoURL: fbUser.photoURL || undefined,
          };
          setUser(authUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        } else {
          // If explicitly signed out in Firebase
          const cached = localStorage.getItem(STORAGE_KEY);
          if (!cached) setUser(null);
        }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (auth && googleProvider) {
      try {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user.email) {
          const authUser: AuthUser = {
            email: result.user.email.toLowerCase(),
            name: result.user.displayName || undefined,
            photoURL: result.user.photoURL || undefined,
          };
          setUser(authUser);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        }
      } catch (err: any) {
        console.error("Google sign in popup error:", err);
        // Fallback to Dad direct login prompt if popup blocked
        loginAsDad();
      }
    } else {
      // Local / Kiosk mode direct login
      loginAsDad();
    }
  };

  const loginAsDad = () => {
    const dadUser: AuthUser = {
      email: DAD_EMAIL,
      name: "Andrew (Dad)",
    };
    setUser(dadUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dadUser));
  };

  const logout = async () => {
    if (auth) {
      try {
        await fbSignOut(auth);
      } catch {
        // ignore
      }
    }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const isAdmin = user?.email?.toLowerCase() === DAD_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading,
        loginWithGoogle,
        loginAsDad,
        logout,
      }}
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
