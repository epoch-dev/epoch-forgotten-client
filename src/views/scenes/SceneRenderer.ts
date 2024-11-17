import { Scene } from 'phaser';
import { AssetsService } from '../../common/services/AssetsService';
import { ScenesService } from './ScenesService';
import { CursorKey, SceneImage, TILE_SIZE, UserSprite } from './types';
import { ScenePoint } from '../../common/api/.generated';
import { MusicService } from '../../common/services/MusicService';
import TileRenderer from './TileRenderer';
import { getCurrentTimeStamp } from '../../common/utils';
import { appConfig } from '../../common/config';
import { SceneMoveDirection, SceneMoveResultDto } from '../../common/api/definitions/sceneTypes';

export class SceneRenderer extends Scene {
    public blockMovement = false;
    public musicUri?: string;
    private user?: UserSprite;
    private onMove: (direction: SceneMoveDirection) => void;
    private onEncounter: (encounter: SceneMoveResultDto['encounterData']) => void;
    private onNpc: (encounter: SceneMoveResultDto['npcData']) => void;
    private musicService = MusicService.getInstance();
    private tileRenderer: TileRenderer;
    private lastMove = getCurrentTimeStamp();
    private sceneImageRef?: SceneImage;
    private arrowsCursor?: CursorKey;
    private wsadCursor?: Partial<CursorKey>;

    constructor({
        onMove,
        onEncounter,
        onNpc,
    }: {
        onMove: (direction: SceneMoveDirection) => void;
        onEncounter: (encounter: SceneMoveResultDto['encounterData']) => void;
        onNpc: (encounter: SceneMoveResultDto['npcData']) => void;
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
        this.setupMovementCursors();
    }

    public async loadScene() {
        const sceneData = await ScenesService.getSceneData();
        const { width, height } = await ScenesService.getSceneSize();
        const userPosition = await ScenesService.getUserPosition();

        setTimeout(() => {
            this.load.image(`scene-${sceneData.name}`, AssetsService.getSceneUri(sceneData.imageUri));
            this.load.start();

            this.musicUri = sceneData.musicUri;
            this.musicService.play(sceneData.musicUri);
        }, 0);

        this.load.on('complete', () => {
            this.sceneImageRef?.destroy();
            this.tileRenderer.clearTiles();

            this.sceneImageRef = this.add.image(width / 2, height / 2, `scene-${sceneData.name}`);
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
            this.fadeIn();

            this.blockMovement = true;
            setTimeout(() => (this.blockMovement = false), 1500);
        });
    }

    private setupMovementCursors() {
        this.wsadCursor = this.input.keyboard?.addKeys({
            up: 'W',
            down: 'S',
            left: 'A',
            right: 'D',
        });
        this.arrowsCursor = this.input.keyboard?.createCursorKeys();
    }

    update() {
        void this.handleMove();
    }

    private async handleMove() {
        if (
            this.lastMove + appConfig.moveInterval > getCurrentTimeStamp() ||
            this.blockMovement ||
            !this.user
        ) {
            return;
        }

        const isUpPressed = this.arrowsCursor?.up.isDown || this.wsadCursor?.up?.isDown;
        const isDownPressed = this.arrowsCursor?.down.isDown || this.wsadCursor?.down?.isDown;
        const isLeftPressed = this.arrowsCursor?.left.isDown || this.wsadCursor?.left?.isDown;
        const isRightPressed = this.arrowsCursor?.right.isDown || this.wsadCursor?.right?.isDown;

        if (!isUpPressed && !isDownPressed && !isLeftPressed && !isRightPressed) {
            return;
        }

        let direction: SceneMoveDirection | undefined = undefined;
        if (isUpPressed) {
            if (isLeftPressed) {
                direction = SceneMoveDirection.UpLeft;
            } else if (isRightPressed) {
                direction = SceneMoveDirection.UpRight;
            } else {
                direction = SceneMoveDirection.Up;
            }
        } else if (isDownPressed) {
            if (isLeftPressed) {
                direction = SceneMoveDirection.DownLeft;
            } else if (isRightPressed) {
                direction = SceneMoveDirection.DownRight;
            } else {
                direction = SceneMoveDirection.Down;
            }
        } else if (isLeftPressed) {
            direction = SceneMoveDirection.Left;
        } else if (isRightPressed) {
            direction = SceneMoveDirection.Right;
        }

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
        encounter?: SceneMoveResultDto['encounterData'];
        npc?: SceneMoveResultDto['npcData'];
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

    private fadeIn(duration = 1000) {
        const width = this.scale.width + TILE_SIZE;
        const height = this.scale.height + TILE_SIZE;

        const fadeRect = this.add
            .rectangle(-TILE_SIZE, -TILE_SIZE, width, height, 0x000000)
            .setOrigin(0)
            .setAlpha(1)
            .setDepth(100);

        this.tweens.add({
            targets: fadeRect,
            alpha: 0,
            duration: duration,
            onComplete: () => {
                fadeRect.destroy();
            },
        });
    }
}
