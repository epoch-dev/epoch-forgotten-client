import { Scene } from 'phaser';
import { SceneTileDto, SceneTileType } from '../../common/api/.generated';
import { SceneTileSprite, TILE_SIZE } from './types';

export default class TileRenderer {
    private scene: Scene;
    private tiles: SceneTileSprite[] = [];
    private tileMap = new Map<string, SceneTileDto>();

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public drawTiles({ tiles }: { tiles: SceneTileDto[] }) {
        this.tiles.forEach((t) => t.spriteRef?.destroy());
        this.tiles = [];
        this.tileMap.clear();

        tiles.forEach((tile) => {
            const key = `${tile.position.x},${tile.position.y}`;
            this.tileMap.set(key, tile);
        });

        tiles.forEach((tile) => {
            switch (tile.type) {
                case SceneTileType.Route:
                case SceneTileType.Collision: {
                    if (this.isBorderingDifferentType(tile)) {
                        const rect = this.getTileRect({ tile, isBorder: true });
                        this.tiles.push({ ...tile, spriteRef: rect });
                    } else {
                        const rect = this.getTileRect({ tile });
                        this.tiles.push({ ...tile, spriteRef: rect });
                    }
                    break;
                }
                case SceneTileType.Passage:
                case SceneTileType.Quest:
                case SceneTileType.Npc:
                case SceneTileType.Encounter: {
                    const rect = this.getTileRect({ tile });
                    this.tiles.push({ ...tile, spriteRef: rect });
                    break;
                }
                case SceneTileType.SafeRoute:
                    break;
            }
        });
    }

    private isBorderingDifferentType(tile: SceneTileDto) {
        const { x, y } = tile.position;
        const neighbors = [
            this.getTileAt(x - TILE_SIZE, y),
            this.getTileAt(x + TILE_SIZE, y),
            this.getTileAt(x, y - TILE_SIZE),
            this.getTileAt(x, y + TILE_SIZE),
        ];
        return neighbors.some((neighbor) => neighbor && neighbor.type !== tile.type);
    }

    private getTileAt(x: number, y: number) {
        return this.tileMap.get(`${x},${y}`);
    }

    private getTileRect({ tile, isBorder }: { tile: SceneTileDto; isBorder?: boolean }) {
        let rect: Phaser.GameObjects.Rectangle;
        switch (tile.type) {
            case SceneTileType.Route:
                return this.scene.add.circle(
                    tile.position.x,
                    tile.position.y,
                    4.75,
                    0xff2222,
                    isBorder ? 0.25 : 0.1,
                );
            case SceneTileType.SafeRoute:
                return this.scene.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0x22ddaa, 0.2);
            case SceneTileType.Collision:
                return this.scene.add.circle(
                    tile.position.x,
                    tile.position.y,
                    4.75,
                    0x000000,
                    isBorder ? 0.33 : 0.1,
                );
            case SceneTileType.Passage:
                return this.scene.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0x90ee90, 0.7);
            case SceneTileType.Quest:
                rect = this.scene.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0xffff00, 0.7);
                this.scene.tweens.add({
                    targets: rect,
                    alpha: { from: 0.5, to: 0.9 },
                    yoyo: true,
                    repeat: -1,
                    duration: 1000,
                });
                return rect;
            case SceneTileType.Npc:
                rect = this.scene.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0xadd8e6, 0.7);
                rect.setStrokeStyle(1, 0x00008b, 0.6);
                return rect;
            case SceneTileType.Encounter:
                rect = this.scene.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0xff0000, 0.7);
                this.scene.tweens.add({
                    targets: rect,
                    alpha: { from: 0.6, to: 0.9 },
                    scale: 1.25,
                    yoyo: true,
                    repeat: -1,
                    duration: 1000,
                });
                return rect;
        }
    }
}
