import { create } from 'zustand'

export type SettingsTab = 'profile' | 'security' | 'preferences'

interface SettingsState {
  open: boolean
  activeTab: SettingsTab
}

interface SettingsActions {
  openSettings: (tab?: SettingsTab) => void
  closeSettings: () => void
  setOpen: (open: boolean) => void
  setActiveTab: (tab: SettingsTab) => void
}

type SettingsStore = SettingsState & SettingsActions

export const useSettingsStore = create<SettingsStore>()(set => ({
  open: false,
  activeTab: 'profile',

  openSettings: (tab = 'profile') => set({ open: true, activeTab: tab }),
  closeSettings: () => set({ open: false }),
  setOpen: open => set({ open }),
  setActiveTab: tab => set({ activeTab: tab }),
}))
