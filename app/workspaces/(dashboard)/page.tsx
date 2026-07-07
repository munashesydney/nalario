import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { WorkspaceCard } from "@/components/workspace/WorkspaceCard";
import { createClient } from "@/lib/supabase/server";

export const dynamic = 'force-dynamic';

export default async function WorkspacesPage() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  }

  const workspaces = (data || []).map(w => ({
    ...w,
    project_count: 0,
    member_count: 1
  }));

  return (
    <div className="flex flex-col space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Your Workspaces</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and collaborate on your design projects.</p>
        </div>
        <Link 
          href="/workspaces/add"
          className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-none font-medium border-2 border-transparent hover:border-zinc-900 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Workspace
        </Link>
      </div>

      {workspaces.length === 0 ? (
        <div className="bg-white rounded-none border-2 border-zinc-200 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-zinc-100 flex items-center justify-center rounded-full mb-4">
            <Plus className="w-8 h-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-900 mb-2">No workspaces yet</h2>
          <p className="text-zinc-500 mb-6 max-w-md">Create your first workspace to start organizing your design projects and collaborating with your team.</p>
          <Link 
            href="/workspaces/add"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 font-bold border-2 border-transparent hover:border-zinc-900 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] transition-all uppercase"
          >
            Create Workspace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </div>
  );
}
