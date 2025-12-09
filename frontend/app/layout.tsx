import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BugTrack Pro - Issue Tracking",
  description: "Professional bug tracking and issue management",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 flex`}
      >
        {/* SIDEBAR FIXED ON LEFT */}
        <Sidebar />

        {/* MAIN CONTENT AREA */}
        <div className="flex flex-col flex-1 min-h-screen">
          
          {/* TOP HEADER */}
          <Header />

          {/* PAGE CONTENT */}
          <main className="p-6">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
