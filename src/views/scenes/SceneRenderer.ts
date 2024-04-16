import { Scene } from 'phaser';
import { AssetsService } from '../../common/services/AssetsService';
import { ScenesService } from './ScenesService';
import { SceneImage, SceneTileSprite, UserSprite } from './types';
import { SceneMoveResultDtoEncounterData, SceneMoveResultDtoNpcData, SceneTileDto, SceneTileType } from '../../common/api/.generated';


export class SceneRenderer extends Scene {
    public blockMovement = false;
    private tiles: SceneTileSprite[] = [];
    private user?: UserSprite;
    private sceneImageRef?: SceneImage;
    private onEncounter: (encounter: SceneMoveResultDtoEncounterData) => void;
    private onNpc: (encounter: SceneMoveResultDtoNpcData) => void;

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
    }

    preload() {
        this.load.image('user-icon', AssetsService.getIcon('user'));
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

        setTimeout(() => {
            this.sceneImageRef = this.add.image(width / 2, height / 2, `scene-${sceneData.name}`);
            this.drawTiles({ tiles: sceneData.tiles });
            this.cameras.main.setBounds(0, 0, width, height);

            this.user?.destroy();
            this.user = this.physics.add.sprite(userPosition.x, userPosition.y, 'user-icon').setDepth(1);

            this.cameras.main.setSize(this.scale.width, this.scale.height);
            this.cameras.main.startFollow(this.user, true, 0.1, 0.1);
            this.cameras.main.setZoom(2);
        }, 100);
    }

    public drawTiles({ tiles }: { tiles: SceneTileDto[] }) {
        this.tiles.forEach((t) => t.spriteRef?.destroy());
        tiles.forEach((tile) => {
            const rect = this.getTileRect({ tile });
            this.tiles.push({ ...tile, spriteRef: rect });
        });
    }

    private getTileRect({ tile }: { tile: SceneTileDto }) {
        switch (tile.type) {
            case SceneTileType.Route:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0x22dd22, 0.1);
            case SceneTileType.SafeRoute:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0x22ddaa, 0.1);
            case SceneTileType.Collision:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0x424242, 0.1);
            case SceneTileType.Passage:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0x2211dd, 0.7);
            case SceneTileType.Quest:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0xffff00, 0.7);
            case SceneTileType.Npc:
                return this.add.rectangle(tile.position.x, tile.position.y, 9, 9, 0xaaff77, 0.7);
            case SceneTileType.Encounter:
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
