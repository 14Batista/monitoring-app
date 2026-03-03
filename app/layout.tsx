import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Service Monitor",
  description: "Real-time service uptime monitoring",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen pb-24">
        <Header
          title={
            typeof metadata.title === "string" ? metadata.title : undefined
          }
        />
        <main className="max-w-md mx-auto p-4 space-y-6">{children}</main>
        <BottomNav />

       
      </body>
    </html>
  );
}
