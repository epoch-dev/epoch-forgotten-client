import { create } from 'zustand';
import { GameView } from './types';
import { SceneRenderer } from '../scenes/SceneRenderer';
import { SceneMoveResultDtoEncounterData, SceneMoveResultDtoNpcData } from '../../common/api/.generated';

type GameStore = {
    scene: SceneRenderer | undefined;
    view: GameView;
    encounter: SceneMoveResultDtoEncounterData | undefined;
    npc: SceneMoveResultDtoNpcData | undefined;
    setView: (view: GameView) => void;
    setScene: (scene: SceneRenderer) => void;
    setEncounter: (encounter: SceneMoveResultDtoEncounterData) => void;
    setNpc: (npc: SceneMoveResultDtoNpcData) => void;
    clear: () => void;
};

export const useGameStore = create<GameStore>()((set) => ({
    scene: undefined,
    view: GameView.World,
    encounter: undefined,
    npc: undefined,
    setScene: (scene: SceneRenderer) => set({ scene }),
    setView: (view: GameView) =>
        set((state) => {
            if (state.scene) {
                state.scene.blockMovement = view !== GameView.World;
            }
            return {
                ...state,
                view,
            };
        }),
    setEncounter: (encounter: SceneMoveResultDtoEncounterData) => set({ encounter }),
    setNpc: (npc: SceneMoveResultDtoNpcData) => set({ npc }),
    clear: () => set({ scene: undefined, view: GameView.World, encounter: undefined, npc: undefined }),
}));
