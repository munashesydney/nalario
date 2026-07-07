import React from "react";
import Link from "next/link";
import { Plus, LayoutTemplate, ArrowLeft } from "lucide-react";
import { ProjectCard } from "@/components/workspace/ProjectCard";
import { NewProjectButton } from "@/components/workspace/NewProjectButton";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function WorkspaceHomePage({ params }: { params: { id: string } }) {
  const workspaceId = params.id;
  const supabase = createClient();
  
  // Fetch workspace
  const { data: workspace, error: wError } = await supabase
    .from('workspaces')
    .select('*')
    .eq('id', workspaceId)
    .single();

  // Fetch projects
  const { data: projects, error: pError } = await supabase
    .from('projects')
    .select('*')
    .eq('workspace_id', workspaceId)
    .order('updated_at', { ascending: false });

  if (wError) console.error(wError);
  if (pError) console.error(pError);

  if (!workspace) {
    return <div>Workspace not found.</div>;
  }

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
                {workspace.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-zinc-900">{workspace.name}</h1>
                <p className="text-zinc-500 mt-1 flex items-center gap-2">
                  <span className="flex items-center gap-1"><LayoutTemplate className="w-4 h-4" /> {projects?.length || 0} Projects</span>
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

          {projects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </div>
  );
}
