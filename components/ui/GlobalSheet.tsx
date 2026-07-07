"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Trash2 } from 'lucide-react'
import { useSheetStore } from '@/lib/store/sheet-store'
import { workspaceService } from '@/lib/services/workspace.service'
import { projectService } from '@/lib/services/project.service'
import { useRouter } from 'next/navigation'

export default function GlobalSheet() {
  const { isOpen, type, data, closeSheet } = useSheetStore()
  const router = useRouter()
  
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form when opened
  useEffect(() => {
    if (isOpen && data) {
      setName(data.name || '')
      setError(null)
    }
  }, [isOpen, data])

  const handleSave = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError(null)

    try {
      if (type === 'edit-workspace') {
        await workspaceService.updateWorkspace(data.id, name)
      } else if (type === 'edit-project') {
        await projectService.updateProject(data.id, name)
      }
      router.refresh()
      closeSheet()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const isConfirmed = window.confirm(`Are you sure you want to delete this ${type === 'edit-workspace' ? 'workspace' : 'project'}? This cannot be undone.`)
    if (!isConfirmed) return
    
    setLoading(true)
    setError(null)

    try {
      if (type === 'edit-workspace') {
        await workspaceService.deleteWorkspace(data.id)
        router.push('/workspaces') // Redirect to list if deleted
      } else if (type === 'edit-project') {
        await projectService.deleteProject(data.id)
      }
      router.refresh()
      closeSheet()
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getTitle = () => {
    if (type === 'edit-workspace') return 'Edit Workspace'
    if (type === 'edit-project') return 'Edit Project'
    return 'Edit'
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeSheet}
            className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-zinc-50 border-l-4 border-zinc-900 z-[110] flex flex-col shadow-[-16px_0px_0px_rgba(24,24,27,1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b-4 border-zinc-900 bg-white">
              <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-tight">{getTitle()}</h2>
              <button 
                onClick={closeSheet}
                className="p-2 hover:bg-pink-100 text-zinc-900 transition-colors border-2 border-transparent hover:border-zinc-900"
              >
                <X className="w-6 h-6 stroke-[3]" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 flex-1 overflow-y-auto flex flex-col gap-6">
              {error && (
                <div className="bg-red-50 border-2 border-red-500 text-red-700 p-4 font-bold text-sm">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="font-bold text-zinc-900 text-sm uppercase">Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border-4 border-zinc-900 bg-white p-4 font-bold text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:bg-pink-50 transition-colors rounded-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t-4 border-zinc-900 bg-white flex flex-col gap-4 mt-auto">
              <button 
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-pink-500 hover:bg-pink-600 disabled:bg-zinc-300 text-white font-bold text-xl py-4 border-4 border-zinc-900 hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(24,24,27,1)] transition-all uppercase"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
              
              <button 
                onClick={handleDelete}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-600 disabled:bg-zinc-300 text-white font-bold text-lg py-3 border-4 border-zinc-900 hover:-translate-y-1 hover:shadow-[4px_4px_0px_rgba(24,24,27,1)] transition-all uppercase flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5 stroke-[3]" />
                Delete
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
