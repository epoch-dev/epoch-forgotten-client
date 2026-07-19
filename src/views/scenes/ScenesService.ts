import { SceneDataDto, ScenePoint } from '../../common/api/.generated';
import { scenesClient } from '../../common/api/client';
import { useGameStore } from '../../views/game/GameStore';
import { GameView } from '../../views/game/types';
import { getSceneGridPixelSize } from './sceneGridSize';

export class ScenesService {
    private static sceneData?: SceneDataDto;
    public static userPosition?: ScenePoint;

    public static async initialize() {
        const data = (await scenesClient.currentScene()).data;
        this.sceneData = data;
        this.userPosition = data.userPosition;
        if (data.pendingDialogueNpcId) {
            useGameStore.setState((prev) => ({
                ...prev,
                view: GameView.Dialogue,
                npcName: data.pendingDialogueNpcId,
            }));
        }
    }

    public static async getSceneData() {
        if (!this.sceneData) {
            await this.initialize();
        }
        return this.sceneData!;
    }

    public static async getSceneSize() {
        const scene = await this.getSceneData();
        return getSceneGridPixelSize({
            columns: scene.columns,
            rows: scene.rows,
            tileSize: scene.tileSize,
        });
    }

    public static async getUserPosition() {
        if (!this.userPosition) {
            await this.initialize();
        }
        return this.userPosition!;
    }
}
