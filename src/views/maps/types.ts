import { MapTileDto } from '../../common/api/.generated';

export type UserSprite = Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;

export type MapTileSprite = MapTileDto & {
    spriteRef: Phaser.GameObjects.Rectangle | undefined;
};

export type CursorKey = Phaser.Types.Input.Keyboard.CursorKeys;

export type MapImage = Phaser.GameObjects.Image;

export type MapsComponentProps = {
    isMovementBlocked: boolean,
    setIsMovementBlocked: (isBlocked: boolean) => void,
    setDialoguedName: (name: string) => void,
}