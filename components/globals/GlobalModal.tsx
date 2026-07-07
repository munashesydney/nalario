"use client";

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useModalStore } from '@/lib/store/modal-store'
import CreateProjectContent from '../workspace/CreateProjectContent'
import ExportProjectContent from '../canvas/ExportModal' // We will rename ExportModal to just export its content

export default function GlobalModal() {
  const { isOpen, type, closeModal } = useModalStore()

  if (!isOpen) return null

  // If type is not one of our global modals, don't render the wrapper
  if (type !== 'create-project' && type !== 'export-project') return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeModal}
        className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-4xl bg-zinc-50 border-4 border-zinc-900 flex flex-col shadow-[8px_8px_0px_rgba(24,24,27,1)] rounded-none overflow-hidden"
        >
          {type === 'create-project' && <CreateProjectContent />}
          {type === 'export-project' && <ExportProjectContent />}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
