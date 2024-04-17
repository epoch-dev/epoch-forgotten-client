import {
    SceneDataDto,
    SceneMoveDirection,
    SceneMoveResultDtoEncounterData,
    SceneMoveResultDtoNpcData,
    ScenePoint,
} from '../../common/api/.generated';
import { ScenesClient } from '../../common/api/client';
import { getCurrentTimeStamp } from '../../common/utils';
import { CursorKey } from './types';

export class ScenesService {
    private static sceneData?: SceneDataDto;
    private static userPosition?: ScenePoint;
    private static lastMove = 0;
    private static MOVE_INTERVAL = 250;

    public static async initialize() {
        const data = (await ScenesClient.currentScene()).data;
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

    public static async moveUser(cursor: CursorKey): Promise<{
        newPosition: ScenePoint;
        sceneChanged: boolean;
        encounter: SceneMoveResultDtoEncounterData | undefined;
        npc: SceneMoveResultDtoNpcData | undefined;
    }> {
        const direction = cursor.left.isDown
            ? SceneMoveDirection.Left
            : cursor.right.isDown
            ? SceneMoveDirection.Right
            : cursor.up.isDown
            ? SceneMoveDirection.Up
            : cursor.down.isDown
            ? SceneMoveDirection.Down
            : undefined;
        if (!direction || this.lastMove + this.MOVE_INTERVAL > getCurrentTimeStamp()) {
            return {
                newPosition: await this.getUserPosition(),
                sceneChanged: false,
                encounter: undefined,
                npc: undefined,
            };
        }
        const moveResult = (
            await ScenesClient.move({
                direction,
            })
        ).data;
        this.lastMove = getCurrentTimeStamp();
        this.userPosition = moveResult.newPosition;
        if (moveResult.newSceneData) {
            await this.initialize();
        }
        return {
            newPosition: await this.getUserPosition(),
            sceneChanged: moveResult.newSceneData !== undefined,
            encounter: moveResult.encounterData,
            npc: moveResult.npcData,
        };
    }
}
