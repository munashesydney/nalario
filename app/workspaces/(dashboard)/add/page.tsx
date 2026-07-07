"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Sparkles, Building, User, Mail, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";

import { workspaceService } from "@/lib/services/workspace.service";

export default function AddWorkspacePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [workspaceName, setWorkspaceName] = useState("");
  const [type, setType] = useState<"personal" | "team">("team");
  const [invites, setInvites] = useState([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdWorkspaceId, setCreatedWorkspaceId] = useState<string | null>(null);

  const handleNext = () => {
    if (step === 1 && !workspaceName.trim()) return;
    setStep(step + 1);
  };

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      const workspace = await workspaceService.createWorkspace(workspaceName);
      setCreatedWorkspaceId(workspace.id);
      setStep(3); // Go to success step
    } catch (err: any) {
      setError(err.message || "Failed to create workspace");
      setStep(1); // Go back to show error
    } finally {
      setLoading(false);
    }
  };

  const handleEnterWorkspace = () => {
    if (createdWorkspaceId) {
      router.push(`/workspaces/${createdWorkspaceId}`);
      router.refresh();
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="mb-8">
        <Link 
          href="/workspaces" 
          className="inline-flex items-center text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Workspaces
        </Link>
      </div>

      <div className="bg-white rounded-none border-2 border-zinc-200 overflow-hidden relative min-h-[450px]">
        
        {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100 flex">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 h-full border-r border-white/50 relative">
              {step >= s && (
                <motion.div 
                  className="absolute inset-0 bg-pink-500" // A sprinkle of pink
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  style={{ originX: 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </div>
          ))}
        </div>

        <div className="p-8 md:p-12 h-full flex flex-col relative overflow-hidden">
          <AnimatePresence mode="wait">
            {/* STEP 1: Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-zinc-900">Create a Workspace</h1>
                  <p className="text-zinc-500 mt-2">Where will your next big idea come to life?</p>
                </div>

                {error && (
                  <div className="bg-red-50 border-2 border-red-500 text-red-700 p-3 mb-6 font-medium text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-900 mb-2">
                      Workspace Name
                    </label>
                    <input
                      type="text"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      placeholder="e.g. Acme Corp Design"
                      className="w-full px-4 py-3 bg-white border-2 border-zinc-200 rounded-none focus:border-zinc-900 focus:ring-0 outline-none transition-all text-zinc-900 font-medium"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-900 mb-3">
                      Workspace Type
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => setType("personal")}
                        className={cn(
                          "flex flex-col items-center p-4 border-2 rounded-none transition-all",
                          type === "personal" 
                            ? "border-zinc-900 bg-zinc-900 text-white" 
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        <User className={cn("w-6 h-6 mb-2", type === "personal" ? "text-white" : "text-zinc-400")} />
                        <span className="font-semibold text-sm">Personal</span>
                      </button>
                      <button
                        onClick={() => setType("team")}
                        className={cn(
                          "flex flex-col items-center p-4 border-2 rounded-none transition-all",
                          type === "team" 
                            ? "border-zinc-900 bg-zinc-900 text-white" 
                            : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                        )}
                      >
                        <Building className={cn("w-6 h-6 mb-2", type === "team" ? "text-white" : "text-zinc-400")} />
                        <span className="font-semibold text-sm">Team</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <button
                    onClick={handleNext}
                    disabled={!workspaceName.trim()}
                    className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-zinc-200 disabled:text-zinc-400 text-white font-semibold py-3 rounded-none border-2 border-transparent hover:border-zinc-900 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] transition-all"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Invites */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col"
              >
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-zinc-900">Invite your team</h1>
                  <p className="text-zinc-500 mt-2">Design is better together. Add some collaborators.</p>
                </div>

                <div className="space-y-3">
                  {invites.map((invite, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                          type="email"
                          value={invite}
                          onChange={(e) => {
                            const newInvites = [...invites];
                            newInvites[idx] = e.target.value;
                            setInvites(newInvites);
                          }}
                          placeholder="colleague@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-white border-2 border-zinc-200 rounded-none focus:border-zinc-900 focus:ring-0 outline-none transition-all text-zinc-900"
                        />
                      </div>
                      {invites.length > 1 && (
                        <button 
                          onClick={() => setInvites(invites.filter((_, i) => i !== idx))}
                          className="p-3 text-zinc-400 hover:text-red-500 hover:bg-zinc-50 border-2 border-transparent hover:border-red-200 rounded-none transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  
                  <button 
                    onClick={() => setInvites([...invites, ""])}
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 mt-2 inline-flex items-center"
                  >
                    + Add another
                  </button>
                </div>

                <div className="mt-auto pt-8 flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border-2 border-zinc-200 hover:border-zinc-900 text-zinc-900 font-semibold rounded-none transition-all"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={loading}
                    className="flex-1 bg-pink-500 hover:bg-pink-600 disabled:bg-zinc-300 text-white font-semibold py-3 rounded-none border-2 border-transparent hover:border-zinc-900 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] transition-all"
                  >
                    {loading ? "Creating..." : "Skip & Create"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Success */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="flex-1 flex flex-col items-center justify-center text-center"
              >
                <div className="w-20 h-20 bg-zinc-900 rounded-none flex items-center justify-center mb-6">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 mb-3">You're all set!</h1>
                <p className="text-zinc-500 max-w-sm mb-8">
                  <strong>{workspaceName}</strong> has been created successfully. Time to start designing.
                </p>

                <button
                  onClick={handleEnterWorkspace}
                  className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-3 px-8 rounded-none border-2 border-transparent hover:border-zinc-900 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] transition-all"
                >
                  Enter Workspace
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
