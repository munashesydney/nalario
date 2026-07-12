"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { LayoutTemplate, ArrowLeft } from "lucide-react";
import { ProjectCard } from "@/components/workspace/ProjectCard";
import { NewProjectButton } from "@/components/workspace/NewProjectButton";
import { ProjectsPagination } from "@/components/workspace/ProjectsPagination";
import { createClient } from "@/lib/supabase/client";
import { Project } from "@/lib/models/project.model";

const PROJECTS_PER_PAGE = 11;

export default function WorkspaceHomePage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { page?: string };
}) {
  const workspaceId = params.id;
  const currentPage = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);

  const [workspace, setWorkspace] = useState<{ id: string; name: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    async function fetchData() {
      setLoading(true);

      const { data: wData } = await supabase
        .from("workspaces")
        .select("id, name")
        .eq("id", workspaceId)
        .single();
      setWorkspace(wData);

      const from = (currentPage - 1) * PROJECTS_PER_PAGE;
      const to = from + PROJECTS_PER_PAGE - 1;

      const { data: pData, count } = await supabase
        .from("projects")
        .select("*", { count: "exact" })
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false })
        .range(from, to);

      setProjects(pData || []);
      setTotalCount(count || 0);
      setLoading(false);
    }

    fetchData();
  }, [workspaceId, currentPage]);

  const handleProjectDeleted = (projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTotalCount((prev) => prev - 1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PROJECTS_PER_PAGE));

  if (loading) {
    return (
      <div className="flex flex-col space-y-8 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-none border-2 border-zinc-200">
          <div className="h-6 w-48 bg-zinc-100 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-[240px] bg-zinc-100 border-2 border-zinc-200 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!workspace) {
    return <div>Workspace not found.</div>;
  }

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900">{workspace.name}</h1>
                <p className="text-zinc-500 mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1"><LayoutTemplate className="w-4 h-4" /> {totalCount} Projects</span>
                  <span className="w-1 h-1 rounded-full bg-zinc-300" />
                  <span>Team Workspace</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-zinc-900">Recent Projects</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <NewProjectButton workspaceId={workspaceId} />

          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onProjectDeleted={handleProjectDeleted}
            />
          ))}
        </div>

        <ProjectsPagination
          workspaceId={workspaceId}
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </div>
  );
}
