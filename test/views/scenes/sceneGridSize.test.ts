import { describe, expect, it } from 'vitest';
import { getSceneGridPixelSize } from '../../../src/views/scenes/sceneGridSize';

describe('sceneGridSize', () => {
    it('fills the world using columns, rows, and tileSize', () => {
        expect(
            getSceneGridPixelSize({
                columns: 122,
                rows: 83,
                tileSize: 10,
            }),
        ).toEqual({
            width: 1220,
            height: 830,
        });
    });
});
