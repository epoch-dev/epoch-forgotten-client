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

    public clearTiles() {
        this.scene.children.removeAll();
        this.tiles = [];
        this.tileMap.clear();
    }

    public drawTiles({ tiles }: { tiles: SceneTileDto[] }) {
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
            case SceneTileType.Route: {
                const size = isBorder ? 1 : 0.5;
                rect = this.scene.add.rectangle(tile.position.x, tile.position.y, size, size, 0xdd1331, 1);
                break;
            }
            case SceneTileType.SafeRoute:
                break;
            case SceneTileType.Collision: {
                const size = isBorder ? 1.5 : 1;
                rect = this.scene.add.rectangle(tile.position.x, tile.position.y, size, size, 0x121212, 1);
                break;
            }
            case SceneTileType.Passage: {
                return this.scene.add.rectangle(tile.position.x, tile.position.y, 8, 8, 0x90ee90, 0.7);
            }
            case SceneTileType.Quest: {
                rect = this.scene.add.rectangle(tile.position.x, tile.position.y, 8, 8, 0xffff00, 0.7);
                this.scene.tweens.add({
                    targets: rect,
                    alpha: { from: 0.5, to: 0.9 },
                    yoyo: true,
                    repeat: -1,
                    duration: 1000,
                });
                break;
            }
            case SceneTileType.Npc: {
                rect = this.scene.add.rectangle(tile.position.x, tile.position.y, 8, 8, 0xadd8e6, 0.7);
                rect.setStrokeStyle(1, 0x00008b, 0.6);
                break;
            }
            case SceneTileType.Encounter: {
                rect = this.scene.add.rectangle(tile.position.x, tile.position.y, 8, 8, 0xff0000, 0.7);
                this.scene.tweens.add({
                    targets: rect,
                    alpha: { from: 0.6, to: 0.9 },
                    scale: 1.25,
                    yoyo: true,
                    repeat: -1,
                    duration: 1000,
                });
                break;
            }
        }
    }
}
