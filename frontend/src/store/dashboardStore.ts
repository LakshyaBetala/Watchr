import { create } from 'zustand';

interface DashboardStore {
  selectedStore: string; // 'all' | 'mumbai' | 'delhi' | 'bangalore'
  setSelectedStore: (id: string) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedStore: 'all',
  setSelectedStore: (id) => set({ selectedStore: id }),
}));
