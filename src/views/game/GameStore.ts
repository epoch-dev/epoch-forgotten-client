import { create } from 'zustand';
import { GameView } from './types';
import { SceneRenderer } from '../scenes/SceneRenderer';
import { CharacterDto, NpcDialogue } from '../../common/api/.generated';
import { MusicService } from '../../common/services/MusicService';
import { SceneMoveResultDto } from '../../common/api/sceneTypes';

type GameStore = {
    scene: SceneRenderer | undefined;
    view: GameView;
    encounter: SceneMoveResultDto['encounterData'] | undefined;
    encounterName: string | undefined;
    npcName: string | undefined;
    dialogue: NpcDialogue | undefined;
    character: CharacterDto | undefined;
    setView: (view: GameView) => void;
    setScene: (scene: SceneRenderer) => void;
    setEncounter: (encounter: SceneMoveResultDto['encounterData']) => void;
    setEncounterName: (encounterName: string) => void;
    setNpcName: (npcName: string) => void;
    setDialogue: (dialogue: NpcDialogue | undefined) => void;
    setCharacter: (character: CharacterDto) => void;
    clear: () => void;
};

export const useGameStore = create<GameStore>()((set) => ({
    scene: undefined,
    view: GameView.World,
    encounter: undefined,
    encounterName: undefined,
    npcName: undefined,
    dialogue: undefined,
    character: undefined,
    setScene: (scene: SceneRenderer) => set({ scene }),
    setView: (view: GameView) =>
        set((state) => {
            const musicUri = state.scene?.musicUri;
            if (view === GameView.World && musicUri) {
                MusicService.getInstance().play(musicUri);
            }
            if (state.scene) {
                state.scene.blockMovement = view !== GameView.World;
            }
            return {
                ...state,
                view,
            };
        }),
    setEncounter: (encounter: SceneMoveResultDto['encounterData']) => set({ encounter }),
    setEncounterName: (encounterName: string) => set({ encounterName }),
    setNpcName: (npcName: string) => set({ npcName }),
    setDialogue: (dialogue: NpcDialogue | undefined) => set({ dialogue }),
    setCharacter: (character: CharacterDto) => set({ character }),
    clear: () => set({ scene: undefined, view: GameView.World, encounter: undefined, npcName: undefined }),
}));
