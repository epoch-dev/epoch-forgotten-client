import { Scene } from 'phaser';
import { AssetsService } from '../../common/services/AssetsService';
import { ScenesService } from './ScenesService';
import { TILE_SIZE, UserSprite } from './types';
import {
    SceneMoveDirection,
    SceneMoveResultDtoEncounterData,
    SceneMoveResultDtoNpcData,
    ScenePoint,
} from '../../common/api/.generated';
import { MusicService } from '../../common/services/MusicService';
import TileRenderer from './TileRenderer';
import { getCurrentTimeStamp } from '../../common/utils';
import { appConfig } from '../../common/config';

export class SceneRenderer extends Scene {
    public blockMovement = false;
    public musicUri?: string;
    private user?: UserSprite;
    private onMove: (direction: SceneMoveDirection) => void;
    private onEncounter: (encounter: SceneMoveResultDtoEncounterData) => void;
    private onNpc: (encounter: SceneMoveResultDtoNpcData) => void;
    private musicService = MusicService.getInstance();
    private tileRenderer: TileRenderer;
    private lastMove = getCurrentTimeStamp();

    constructor({
        onMove,
        onEncounter,
        onNpc,
    }: {
        onMove: (direction: SceneMoveDirection) => void;
        onEncounter: (encounter: SceneMoveResultDtoEncounterData) => void;
        onNpc: (encounter: SceneMoveResultDtoNpcData) => void;
    }) {
        super({ key: 'WorldScene' });
        this.onMove = onMove;
        this.onEncounter = onEncounter;
        this.onNpc = onNpc;
        this.tileRenderer = new TileRenderer(this);
    }

    preload() {
        this.load.image('user-icon', AssetsService.getIcon('USER'));
    }

    create() {
        void this.loadScene();
    }

    public async loadScene() {
        const sceneData = await ScenesService.getSceneData();
        const { width, height } = await ScenesService.getSceneSize();
        const userPosition = await ScenesService.getUserPosition();

        this.tileRenderer.clearTiles();
        this.load.image(`scene-${sceneData.name}`, AssetsService.getSceneUri(sceneData.imageUri));
        this.load.start();

        this.musicUri = sceneData.musicUri;
        this.musicService.play(sceneData.musicUri);

        setTimeout(() => {
            this.add.image(width / 2, height / 2, `scene-${sceneData.name}`);
            this.tileRenderer.drawTiles({ tiles: sceneData.tiles });

            this.user?.destroy();
            this.user = this.physics.add
                .sprite(userPosition.x, userPosition.y, 'user-icon')
                .setDepth(10)
                .setScale(1 / 4);

            this.cameras.main.setBounds(
                -TILE_SIZE / 2,
                -TILE_SIZE / 2,
                width + TILE_SIZE,
                height + TILE_SIZE,
            );
            this.cameras.main.setSize(this.scale.width, this.scale.height);
            this.cameras.main.startFollow(this.user, true, 0.1, 0.1);
            this.cameras.main.setZoom(2);
        }, 100);
    }

    update() {
        void this.handleMove();
    }

    private async handleMove() {
        if (
            this.lastMove + appConfig.moveInterval > getCurrentTimeStamp() ||
            this.blockMovement ||
            !this.user ||
            !this.input.keyboard
        ) {
            return;
        }
        const cursor = this.input.keyboard.createCursorKeys();
        const direction = cursor.left.isDown
            ? SceneMoveDirection.Left
            : cursor.right.isDown
            ? SceneMoveDirection.Right
            : cursor.up.isDown
            ? SceneMoveDirection.Up
            : cursor.down.isDown
            ? SceneMoveDirection.Down
            : undefined;
        if (direction) {
            this.onMove(direction);
            this.lastMove = getCurrentTimeStamp();
        }
    }

    public moveUser({
        newPosition,
        sceneChanged,
        encounter,
        npc,
    }: {
        newPosition: ScenePoint;
        sceneChanged: boolean;
        encounter?: SceneMoveResultDtoEncounterData;
        npc?: SceneMoveResultDtoNpcData;
    }) {
        if (this.user) {
            this.tweens.add({
                targets: this.user,
                x: newPosition.x,
                y: newPosition.y,
                duration: 0.9 * appConfig.moveInterval,
                ease: 'Linear',
            });
        }
        if (sceneChanged) {
            void this.loadScene();
        }
        if (encounter) {
            this.onEncounter(encounter);
        }
        if (npc) {
            this.onNpc(npc);
        }
    }
}
