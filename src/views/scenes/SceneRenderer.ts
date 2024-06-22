import { Scene } from 'phaser';
import { AssetsService } from '../../common/services/AssetsService';
import { ScenesService } from './ScenesService';
import { SceneImage, TILE_SIZE, UserSprite } from './types';
import {
    SceneMoveResultDtoEncounterData,
    SceneMoveResultDtoNpcData,
} from '../../common/api/.generated';
import { MusicService } from '../../common/services/MusicService';
import TileRenderer from './TileRenderer';

export class SceneRenderer extends Scene {
    public blockMovement = false;
    public musicUri?: string;
    private user?: UserSprite;
    private sceneImageRef?: SceneImage;
    private onEncounter: (encounter: SceneMoveResultDtoEncounterData) => void;
    private onNpc: (encounter: SceneMoveResultDtoNpcData) => void;
    private musicService = MusicService.getInstance();
    private tileRenderer: TileRenderer;

    constructor({
        onEncounter,
        onNpc,
    }: {
        onEncounter: (encounter: SceneMoveResultDtoEncounterData) => void;
        onNpc: (encounter: SceneMoveResultDtoNpcData) => void;
    }) {
        super({ key: 'WorldScene' });
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

        this.sceneImageRef?.destroy();
        this.load.image(`scene-${sceneData.name}`, AssetsService.getSceneUri(sceneData.imageUri));
        this.load.start();

        this.musicUri = sceneData.musicUri;
        this.musicService.play(sceneData.musicUri);

        setTimeout(() => {
            this.sceneImageRef = this.add.image(width / 2, height / 2, `scene-${sceneData.name}`);
            this.tileRenderer.drawTiles({ tiles: sceneData.tiles });

            this.user?.destroy();
            this.user = this.physics.add
                .sprite(userPosition.x, userPosition.y, 'user-icon')
                .setDepth(10)
                .setScale(1 / 16);

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
        void this.moveUser();
    }

    private async moveUser() {
        if (this.blockMovement || !this.user || !this.input.keyboard) {
            return;
        }
        const cursor = this.input.keyboard.createCursorKeys();
        const moveResult = await ScenesService.moveUser(cursor);
        if (moveResult.sceneChanged) {
            this.loadScene();
        }
        if (moveResult.encounter) {
            this.onEncounter(moveResult.encounter);
        }
        if (moveResult.npc) {
            this.onNpc(moveResult.npc);
        }
        this.user.setPosition(moveResult.newPosition.x, moveResult.newPosition.y);
    }
}
