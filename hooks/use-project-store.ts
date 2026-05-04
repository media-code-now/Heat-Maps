import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Project = {
  id: string;
  businessName: string;
  website: string;
  googleBusinessProfileName: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  createdAt: string;
};

type ProjectInput = Omit<Project, "id" | "createdAt">;

type ProjectStore = {
  projects: Project[];
  hasHydrated: boolean;
  addProject: (project: ProjectInput) => Project;
  getProject: (id: string) => Project | undefined;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      hasHydrated: false,
      addProject: (project) => {
        const createdProject = {
          ...project,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          projects: [createdProject, ...state.projects],
        }));

        return createdProject;
      },
      getProject: (id) => get().projects.find((project) => project.id === id),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "heat-map-projects",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
