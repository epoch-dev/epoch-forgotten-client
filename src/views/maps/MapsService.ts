import { MapDataDto, MapMoveDirection, MapPoint } from '../../common/api/.generated';
import { MapsClient } from '../../common/api/client';
import { getCurrentTimeStamp } from '../../common/utils';
import { CursorKey } from './types';

export class MapsService {
    private static mapData?: MapDataDto;
    private static userPosition?: MapPoint;
    private static lastMove = 0;
    private static MOVE_INTERVAL = 250;

    public static async initialize() {
        const mapData = (await MapsClient.currentMap()).data;
        this.mapData = mapData;
        this.userPosition = mapData.userPosition;
    }

    public static async getMapData() {
        if (!this.mapData) {
            await this.initialize();
        }
        return this.mapData!;
    }

    public static async getMapSize() {
        const map = await this.getMapData();
        let width = 0;
        let height = 0;
        map.tiles.forEach((tile) => {
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

    public static async moveUser(cursor: CursorKey) {
        const direction = cursor.left.isDown
            ? MapMoveDirection.Left
            : cursor.right.isDown
            ? MapMoveDirection.Right
            : cursor.up.isDown
            ? MapMoveDirection.Up
            : cursor.down.isDown
            ? MapMoveDirection.Down
            : undefined;
        if (!direction || this.lastMove + this.MOVE_INTERVAL > getCurrentTimeStamp()) {
            return this.getUserPosition();
        }
        const res = await MapsClient.move({
            direction,
        });
        this.lastMove = getCurrentTimeStamp();
        this.userPosition = res.data.newPosition;
        return this.getUserPosition();
    }
}
