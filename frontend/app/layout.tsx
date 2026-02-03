import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        className={`antialiased bg-gray-50 flex`}
      >
        {children}
      </body>
    </html>
  );
}
