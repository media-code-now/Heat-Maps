import { create } from "zustand";

type DashboardState = {
  activeLayer: "density" | "revenue" | "risk";
  setActiveLayer: (layer: DashboardState["activeLayer"]) => void;
};

export const useDashboardStore = create<DashboardState>((set) => ({
  activeLayer: "density",
  setActiveLayer: (activeLayer) => set({ activeLayer }),
}));
