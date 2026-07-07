import { create } from 'zustand'

export type ModalType = 'create-project' | 'export-project' | null

interface ModalState {
  isOpen: boolean
  type: ModalType
  data: any
  openModal: (type: ModalType, data?: any) => void
  closeModal: () => void
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  type: null,
  data: null,
  openModal: (type, data = null) => set({ isOpen: true, type, data }),
  closeModal: () => set({ isOpen: false, type: null, data: null }),
}))
