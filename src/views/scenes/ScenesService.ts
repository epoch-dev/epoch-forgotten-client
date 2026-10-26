import {
    currentScene,
    SceneDataDto,
    ScenePoint,
} from '../../common/api/.generated';
import { useGameStore } from '../../views/game/GameStore';
import { GameView } from '../../views/game/types';
import { getSceneGridPixelSize } from './sceneGridSize';

export class ScenesService {
    private static sceneData?: SceneDataDto;
    public static userPosition?: ScenePoint;

    public static async initialize() {
        const data = await currentScene();
        this.sceneData = data;
        this.userPosition = data.userPosition;
    }

    public static openPendingDialogue() {
        const pendingDialogueNpcId = this.sceneData?.pendingDialogueNpcId;
        if (!pendingDialogueNpcId) {
            return;
        }
        useGameStore.setState((prev) => ({
            ...prev,
            view: GameView.Dialogue,
            npcName: pendingDialogueNpcId,
        }));
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
