import { create } from 'zustand';

export const useActiveVisitStore = create((set) => ({
  activeVisitId: null,
  currentDoctor: null,
  isVisitActive: false,
  visitStatus: "STARTED", // Matches schema: "STARTED" | "VISITED" | "COMPLETED"

  startVisitSession: (visitId, doctor) => set({
    activeVisitId: visitId,
    currentDoctor: doctor,
    isVisitActive: true,
    visitStatus: "STARTED"
  }),

  updateVisitStatus: (status) => set({ visitStatus: status }),

  endVisitSession: () => set({
    activeVisitId: null,
    currentDoctor: null,
    isVisitActive: false,
    visitStatus: "COMPLETED"
  })
}));
