import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { UserSettings } from '../types';

const initialState: UserSettings = {
    musicVolume: 1,
    isMusicMuted: false,
    soundVolume: 1,
    isSoundMuted: false,
};

type SettingsStore = UserSettings & {
    setMusicVolume: (volume: number) => void;
    setIsMusicMuted: (muted: boolean) => void;
    setSoundVolume: (volume: number) => void;
    setIsSoundMuted: (muted: boolean) => void;
};

export const useSettingsStore = create(
    persist<SettingsStore>(
        (set) => ({
            ...initialState,
            setMusicVolume: (volume: number) => set({ musicVolume: volume }),
            setIsMusicMuted: (muted: boolean) => set({ isMusicMuted: muted }),
            setSoundVolume: (volume: number) => set({ soundVolume: volume }),
            setIsSoundMuted: (muted: boolean) => set({ isSoundMuted: muted }),
        }),
        {
            name: 'epoch-forgotten-settings',
            storage: createJSONStorage(() => localStorage),
        },
    ),
);
