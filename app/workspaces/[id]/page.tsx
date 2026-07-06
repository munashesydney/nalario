"use client";

import React from "react";
import Link from "next/link";
import { Plus, MoreVertical, LayoutTemplate, Clock, ArrowLeft } from "lucide-react";
import { useParams } from "next/navigation";
import { cn } from "../../../lib/utils";

// Mock Data
const MOCK_PROJECTS = [
  { id: "p1", name: "Q3 Marketing Campaign", modified: "Just now", coverColor: "bg-zinc-100" },
  { id: "p2", name: "Landing Page Redesign", modified: "2 hours ago", coverColor: "bg-zinc-200" },
  { id: "p3", name: "Social Media Assets", modified: "Yesterday", coverColor: "bg-zinc-100" },
  { id: "p4", name: "Brand Guidelines", modified: "3 days ago", coverColor: "bg-zinc-200" },
  { id: "p5", name: "App Onboarding Flow", modified: "Last week", coverColor: "bg-zinc-100" },
];

export default function WorkspaceHomePage() {
  const params = useParams();
  const workspaceId = params.id as string;
  
  // In a real app, fetch workspace details based on ID
  const workspaceName = workspaceId === "1" ? "Personal Canvas" 
    : workspaceId === "2" ? "Marketing Team" 
    : workspaceId === "3" ? "Client Designs"
    : "New Workspace";

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="bg-white p-8 rounded-none border-2 border-zinc-200 relative overflow-hidden">
        
        <div className="relative z-10 flex flex-col items-start md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link 
              href="/workspaces" 
              className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-3"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Workspaces
            </Link>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-none bg-zinc-900 flex items-center justify-center text-white font-bold text-3xl">
                {workspaceName.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900">{workspaceName}</h1>
                <p className="text-zinc-500 mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1"><LayoutTemplate className="w-4 h-4" /> 12 Projects</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span>Team Workspace</span>
                </p>
              </div>
            </div>
          </div>
          
          <Link 
            href="/"
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-none font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Project
          </Link>
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Recent Projects</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {/* Create New Card */}
          <Link 
            href="/"
            className="group flex flex-col items-center justify-center h-[240px] rounded-none border-2 border-dashed border-zinc-200 hover:border-zinc-900 hover:bg-zinc-50 transition-all cursor-pointer"
          >
            <div className="w-12 h-12 rounded-none bg-zinc-100 group-hover:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-white transition-colors mb-3">
              <Plus className="w-6 h-6" />
            </div>
            <span className="font-semibold text-zinc-600 group-hover:text-zinc-900 transition-colors">Blank Canvas</span>
          </Link>

          {/* Project Cards */}
          {MOCK_PROJECTS.map((project) => (
            <Link
              href="/"
              key={project.id}
              className="group bg-white rounded-none border-2 border-zinc-200 overflow-hidden hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] hover:border-zinc-900 transition-all duration-200 flex flex-col h-[240px]"
            >
              <div className={cn("flex-1 p-6 flex items-center justify-center relative", project.coverColor)}>
                <div className="w-16 h-16 bg-white/50 backdrop-blur-sm rounded-none border-2 border-white/60 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                  <LayoutTemplate className="w-8 h-8 text-black/40" />
                </div>
                {/* Hover overlay for open button */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-zinc-900 text-white font-semibold px-4 py-2 rounded-none shadow-sm translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                    Open Project
                  </span>
                </div>
              </div>
              <div className="p-4 bg-white border-t border-zinc-100 flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-zinc-900 text-sm truncate w-[160px]">{project.name}</h3>
                  <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {project.modified}
                  </p>
                </div>
                <button 
                  onClick={(e) => { e.preventDefault(); }}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-md transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
