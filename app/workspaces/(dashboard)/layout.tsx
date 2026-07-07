"use client";

import React from "react";
import Link from "next/link";
import { Layers, Search, Bell, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import GlobalSheet from "@/components/ui/GlobalSheet";
import GlobalModal from "@/components/ui/GlobalModal";

export default function WorkspacesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="h-14 bg-white border-b border-zinc-200 px-4 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link href="/workspaces" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-zinc-900 rounded-none flex items-center justify-center transition-colors">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-zinc-900 text-lg tracking-tight transition-colors">
              Canvas
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 ml-4">
            <Link
              href="/workspaces"
              className={cn(
                "py-4 text-sm font-medium border-b-2 transition-colors",
                pathname === "/workspaces" ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-900"
              )}
            >
              Workspaces
            </Link>
            <Link
              href="#"
              className="py-4 text-sm font-medium border-b-2 border-transparent text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Recent
            </Link>
            <Link
              href="#"
              className="py-4 text-sm font-medium border-b-2 border-transparent text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              Trash
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 h-9 pl-9 pr-3 bg-zinc-100 border-none rounded-none text-sm outline-none focus:ring-1 focus:ring-zinc-900 transition-all"
            />
          </div>
          <button className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 bg-zinc-900 flex items-center justify-center text-white text-sm font-bold">M</div>
          <button className="md:hidden p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-4 md:p-8">
        {children}
      </main>

      <GlobalSheet />
      <GlobalModal />
    </div>
  );
}
