import { Scene } from 'phaser';
import { AssetsService } from '../../common/services/AssetsService';
import { MapsService } from './MapsService';
import { MapImage, MapTileSprite, UserSprite } from './types';
import { MapTileDto, MapTileType } from '../../common/api/.generated';

export class MapScene extends Scene {
    private tiles: MapTileSprite[] = [];
    private user?: UserSprite;
    private mapImageRef?: MapImage;
    private blockMovement = false;

    constructor() {
        super({ key: 'WorldScene' });
    }

    preload() {
        this.load.image('user-icon', AssetsService.getIcon('user'));
    }

    create() {
        void this.loadMap();
    }

    public async loadMap() {
        const mapData = await MapsService.getMapData();
        const { width, height } = await MapsService.getMapSize();
        const userPosition = await MapsService.getUserPosition();

        this.mapImageRef?.destroy();
        this.load.image(`map-${mapData.name}`, AssetsService.getMapUri(mapData.imageUri));
        this.load.start();

        setTimeout(() => {
            this.mapImageRef = this.add.image(width / 2, height / 2, `map-${mapData.name}`);
            this.drawTiles({ tiles: mapData.tiles });

            this.user?.destroy();
            this.user = this.physics.add.sprite(userPosition.x, userPosition.y, 'user-icon').setDepth(1);

            this.cameras.main.setSize(this.scale.width, this.scale.height);
            this.cameras.main.startFollow(this.user, true, 0.1, 0.1);
            this.cameras.main.setZoom(2);
        }, 100);
    }

    public drawTiles({ tiles }: { tiles: MapTileDto[] }) {
        this.tiles.forEach((t) => t.spriteRef?.destroy());
        tiles.forEach((tile) => {
            const rect = this.getTileRect({ tile });
            this.tiles.push({ ...tile, spriteRef: rect });
        });
    }

    private getTileRect({ tile }: { tile: MapTileDto }) {
        switch (tile.type) {
            case MapTileType.Route:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0x22dd22, 0.1);
            case MapTileType.SafeRoute:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0x22ddaa, 0.1);
            case MapTileType.Collision:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0x424242, 0.1);
            case MapTileType.Passage:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0x2211dd, 0.7);
            case MapTileType.Quest:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0xffff00, 0.7);
            case MapTileType.Npc:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0xaaff77, 0.7);
            case MapTileType.Encounter:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0xdd1122, 0.7);
        }
    }

    update() {
        void this.moveUser();
    }

    private async moveUser() {
        if (this.blockMovement || !this.user || !this.input.keyboard) {
            return;
        }
        const cursor = this.input.keyboard.createCursorKeys();
        const { newPosition, mapChanged } = await MapsService.moveUser(cursor);
        if (mapChanged) {
            this.loadMap();
        }
        this.user.setPosition(newPosition.x, newPosition.y);
    }
}
