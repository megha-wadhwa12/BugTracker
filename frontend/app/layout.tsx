import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

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
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#0a1310",
              color: "#e6f4ef",
              border: "1px solid #13261d",
            },
          }}
        />
      </body>
    </html>
  );
}
