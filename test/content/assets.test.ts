import { describe, expect, it, vi } from 'vitest';
import {
    checkAssetAvailability,
    checkAssetInventory,
    classifyAssetReference,
    projectAssetReference,
    resolveAssetUrl,
} from '../../src/content/assets';

describe('asset outcomes', () => {
    it('classifies compiler asset references into URL categories', () => {
        expect(classifyAssetReference('story/main-1.png')).toBe('character');
        expect(classifyAssetReference('group1/ratcat.png')).toBe('enemy');
        expect(classifyAssetReference('items/potion.png')).toBe('item');
        expect(classifyAssetReference('starting-village.png')).toBe('scene');
    });

    it('builds asset URLs with existing AssetsService rules', () => {
        const status = projectAssetReference('items/potion.png');
        expect(status.url).toBe(resolveAssetUrl('items/potion.png', 'item'));
        expect(status.url).toContain('images/items/items/potion.png');
    });

    it('marks assets available when HEAD succeeds', async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        const result = await checkAssetAvailability(projectAssetReference('starting-village.png'), fetchImpl);
        expect(result.available).toBe(true);
        expect(result.statusCode).toBe(200);
    });

    it('marks assets missing when HEAD fails', async () => {
        const fetchImpl = vi.fn().mockRejectedValue(new Error('network'));
        const result = await checkAssetAvailability(projectAssetReference('missing.png'), fetchImpl);
        expect(result.available).toBe(false);
    });

    it('uses compiler-provided categories for ambiguous audio filenames', async () => {
        const fetchImpl = vi.fn().mockResolvedValue({ ok: true, status: 200 });
        const [music, sound] = await checkAssetInventory(
            [
                { category: 'music', reference: 'cave.ogg' },
                { category: 'sound', reference: 'punch.ogg' },
            ],
            fetchImpl,
        );
        expect(music?.url).toContain('audio/music/cave.ogg');
        expect(sound?.url).toContain('audio/sounds/punch.ogg');
    });
});
