import { SceneTileDto } from '../../common/api/.generated';

export type UserSprite = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export type SceneTileSprite = SceneTileDto & {
    spriteRef: Phaser.GameObjects.Rectangle | undefined;
};

export type CursorKey = Phaser.Types.Input.Keyboard.CursorKeys;

export type SceneImage = Phaser.GameObjects.Image;
