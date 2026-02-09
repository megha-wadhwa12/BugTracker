"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from '@/store/authStore'
import { useEffect } from "react";
import { Loader } from "lucide-react";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const { isAuthenticated, loading, initAuth } = useAuthStore();

  useEffect(() => {
    initAuth();
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen min-w-screen flex items-center justify-center bg-main">
        <Loader className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen min-w-screen bg-main text-primary">
      {children}
    </div>
  );
}
