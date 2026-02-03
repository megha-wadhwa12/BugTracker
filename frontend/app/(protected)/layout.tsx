"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import AuthGuard from "@/components/auth/authGuard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-main">
        {/* SIDEBAR */}
        <Sidebar />

        {/* MAIN AREA */}
        <div className="flex flex-col flex-1">
          <Header />

          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    // </AuthGuard>
  );
}
