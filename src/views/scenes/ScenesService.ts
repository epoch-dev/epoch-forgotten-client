import { SceneDataDto, ScenePoint } from '../../common/api/.generated';
import { scenesClient } from '../../common/api/client';

export class ScenesService {
    private static sceneData?: SceneDataDto;
    public static userPosition?: ScenePoint;

    public static async initialize() {
        const data = (await scenesClient.currentScene()).data;
        this.sceneData = data;
        this.userPosition = data.userPosition;
    }

    public static async getSceneData() {
        if (!this.sceneData) {
            await this.initialize();
        }
        return this.sceneData!;
    }

    public static async getSceneSize() {
        const scene = await this.getSceneData();
        let width = 0;
        let height = 0;
        scene.tiles.forEach((tile) => {
            width = Math.max(width, tile.position.x);
            height = Math.max(height, tile.position.y);
        });
        return { width, height };
    }

    public static async getUserPosition() {
        if (!this.userPosition) {
            await this.initialize();
        }
        return this.userPosition!;
    }
}
