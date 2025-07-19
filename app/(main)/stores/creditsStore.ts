// src/stores/creditsStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface CreditsState {
  credits: number | null;
  loading: boolean;
  error: string | null;
  userId: string | null;
}

interface CreditsActions {
  setCredits: (credits: number, userId?: string) => void;
  updateCredits: (newCredits: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type CreditsStore = CreditsState & CreditsActions;

const initialState: CreditsState = {
  credits: null,
  loading: false,
  error: null,
  userId: null,
};

export const useCreditsStore = create<CreditsStore>()(
  devtools(
    (set, get) => ({
      ...initialState,

      setCredits: (credits: number, userId?: string) => {
        set(
          (state) => ({
            ...state,
            credits,
            userId: userId || state.userId,
            error: null,
          }),
          false,
          'setCredits'
        );
      },

      updateCredits: (newCredits: number) => {
        set(
          (state) => ({
            ...state,
            credits: newCredits,
            error: null,
          }),
          false,
          'updateCredits'
        );
      },

      setLoading: (loading: boolean) => {
        set(
          (state) => ({
            ...state,
            loading,
          }),
          false,
          'setLoading'
        );
      },

      setError: (error: string | null) => {
        set(
          (state) => ({
            ...state,
            error,
            loading: false,
          }),
          false,
          'setError'
        );
      },

      reset: () => {
        set(initialState, false, 'reset');
      },
    }),
    {
      name: 'credits-store',
    }
  )
);

// Selector hooks for better performance
export const useCredits = () => useCreditsStore((state) => state.credits);
export const useCreditsLoading = () => useCreditsStore((state) => state.loading);
export const useCreditsError = () => useCreditsStore((state) => state.error);

// Individual action selectors (recommended approach)
export const useSetCredits = () => useCreditsStore((state) => state.setCredits);
export const useUpdateCredits = () => useCreditsStore((state) => state.updateCredits);
export const useSetCreditsLoading = () => useCreditsStore((state) => state.setLoading);
export const useSetCreditsError = () => useCreditsStore((state) => state.setError);
export const useResetCredits = () => useCreditsStore((state) => state.reset);