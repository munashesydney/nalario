"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Smartphone, Monitor } from 'lucide-react'
import { useModalStore } from '@/lib/store/modal-store'
import { projectService } from '@/lib/services/project.service'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const TEMPLATES = [
  { id: '1080x1080', name: 'Instagram Post', width: 1080, height: 1080, icon: Smartphone },
  { id: '1920x1080', name: 'Web Desktop', width: 1920, height: 1080, icon: Monitor },
  { id: '1080x1920', name: 'Instagram Story', width: 1080, height: 1920, icon: Smartphone },
  { id: 'custom', name: 'Custom Size', width: 500, height: 500, icon: Monitor },
]

export default function GlobalModal() {
  const { isOpen, type, data, closeModal } = useModalStore()
  const router = useRouter()
  
  const [name, setName] = useState('Untitled Project')
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[1]) // Default to 1920x1080
  const [customWidth, setCustomWidth] = useState(500)
  const [customHeight, setCustomHeight] = useState(500)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    try {
      if (type === 'create-project') {
        const workspaceId = data?.workspaceId
        if (!workspaceId) throw new Error("Workspace ID missing")
        
        const finalWidth = selectedTemplate.id === 'custom' ? customWidth : selectedTemplate.width
        const finalHeight = selectedTemplate.id === 'custom' ? customHeight : selectedTemplate.height

        const project = await projectService.createProject(workspaceId, name, finalWidth, finalHeight)
        router.push(`/workspaces/${workspaceId}/project/${project.id}`)
      }
      closeModal()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (type !== 'create-project') return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-zinc-50 border-4 border-zinc-900 flex flex-col shadow-[8px_8px_0px_rgba(24,24,27,1)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b-4 border-zinc-900 bg-white">
                <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">Create New Project</h2>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-pink-100 text-zinc-900 transition-colors border-2 border-transparent hover:border-zinc-900"
                >
                  <X className="w-6 h-6 stroke-[3]" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col gap-6 bg-zinc-50">
                {error && (
                  <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 font-bold text-sm">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-zinc-900 text-sm uppercase">Project Name</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-4 border-zinc-900 bg-white p-4 font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-pink-50 transition-colors rounded-none"
                    placeholder="e.g. Hero Section Design"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-zinc-900 text-sm uppercase">Canvas Size</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {TEMPLATES.map((t) => {
                      const isSelected = selectedTemplate.id === t.id
                      return (
                        <button
                          key={t.id}
                          onClick={() => setSelectedTemplate(t)}
                          className={cn(
                            "flex flex-col items-center justify-center p-4 border-4 transition-all",
                            isSelected 
                              ? "border-zinc-900 bg-zinc-900 text-white shadow-[4px_4px_0px_rgba(244,114,182,1)] translate-x-[-2px] translate-y-[-2px]" 
                              : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-900 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
                          )}
                        >
                          <t.icon className="w-6 h-6 mb-2" />
                          <span className="font-bold text-xs text-center">{t.name}</span>
                          {t.id !== 'custom' && (
                            <span className="text-[10px] mt-1 opacity-70 font-mono">
                              {t.width} × {t.height}
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {selectedTemplate.id === 'custom' && (
                  <div className="grid grid-cols-2 gap-4 p-4 border-4 border-zinc-900 bg-white">
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-zinc-900 text-xs uppercase">Width (px)</label>
                      <input 
                        type="number" 
                        value={customWidth}
                        onChange={(e) => setCustomWidth(Number(e.target.value))}
                        className="w-full border-2 border-zinc-200 focus:border-zinc-900 bg-zinc-50 p-3 font-mono font-bold text-zinc-900 focus:outline-none transition-colors rounded-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="font-bold text-zinc-900 text-xs uppercase">Height (px)</label>
                      <input 
                        type="number" 
                        value={customHeight}
                        onChange={(e) => setCustomHeight(Number(e.target.value))}
                        className="w-full border-2 border-zinc-200 focus:border-zinc-900 bg-zinc-50 p-3 font-mono font-bold text-zinc-900 focus:outline-none transition-colors rounded-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t-4 border-zinc-900 bg-white flex justify-end gap-4 mt-auto">
                <button 
                  onClick={closeModal}
                  className="px-6 py-3 border-4 border-zinc-200 hover:border-zinc-900 text-zinc-900 font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  disabled={loading}
                  className="px-8 py-3 bg-pink-500 hover:bg-pink-600 disabled:bg-zinc-300 text-white font-bold border-4 border-zinc-900 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] transition-all uppercase"
                >
                  {loading ? "Creating..." : "Create Project"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
