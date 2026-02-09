import { userProfileAPI } from "@/services/auth";
import { create } from "zustand";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;

  initAuth: () => void;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,

  login: (token, user) => {
    localStorage.setItem("token", token);

    set({
      token,
      user,
      isAuthenticated: true,
      loading: false,
    });
  },

  logout: () => {
    localStorage.removeItem("token");

    set({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  },

  initAuth: async () => {
    if (typeof window === "undefined") return;

    const token = localStorage.getItem("token");

    if (!token) {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      });
      return;
    }

    try {
      set({ loading: true });
      const user = await userProfileAPI();
      set({
        token,
        user,
        isAuthenticated: true,
        loading: false
      })

    } catch (error) {
      localStorage.removeItem("token");
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
      });
    }
  },
}));
