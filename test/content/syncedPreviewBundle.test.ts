import { describe, expect, it } from 'vitest';
import { describePreviewBundleErrors } from '../../src/content/guard';

const syncedBundleModules = import.meta.glob<unknown>(
    '../../src/content/.generated/preview-bundle.json',
    {
        eager: true,
        import: 'default',
    },
);
const syncedBundle = Object.values(syncedBundleModules)[0];
const testSyncedBundle = syncedBundle === undefined ? it.skip : it;

describe('synced preview bundle', () => {
    testSyncedBundle('passes the deep preview guard when present locally', () => {
        expect(describePreviewBundleErrors(syncedBundle)).toEqual([]);
    });
});
