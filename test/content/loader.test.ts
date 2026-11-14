import { describe, expect, it, vi } from 'vitest';
import { buildPreviewRecoveryMessage, loadPreviewBundle, parsePreviewBundle } from '../../src/content/loader';
import { previewBundleFixture } from '../fixtures/previewBundle';

const SYNC_COMMAND = 'yarn content:sync-preview';

const rejection = (kind: 'missing' | 'invalid' | 'stale', detail: string) => ({
    kind,
    syncCommand: SYNC_COMMAND,
    message: `Preview bundle missing or stale.${detail} From epoch-forgotten run: ${SYNC_COMMAND}`,
});

describe('preview loader', () => {
    it('parses a valid in-memory bundle', () => {
        expect(parsePreviewBundle(previewBundleFixture)).toEqual({
            kind: 'loaded',
            bundle: previewBundleFixture,
        });
    });

    it('returns a direct sync command and the first diagnostic for invalid v3 bundles', () => {
        expect(parsePreviewBundle({ version: 3 })).toEqual(
            rejection('invalid', ' Missing or invalid sourceHash.'),
        );
    });

    it.each([1, 2])('rejects an otherwise valid v%i bundle explicitly as stale', (version) => {
        expect(parsePreviewBundle({ ...previewBundleFixture, version })).toEqual(
            rejection('stale', ` Expected bundle version 3, got ${version}.`),
        );
    });

    it('builds recovery text with optional guard diagnostics', () => {
        expect(buildPreviewRecoveryMessage(['Dialogue missing startNodeId.'])).toBe(
            rejection('invalid', ' Dialogue missing startNodeId.').message,
        );
    });

    it('loads the imported bundle module', async () => {
        await expect(loadPreviewBundle(async () => ({ default: previewBundleFixture }))).resolves.toEqual({
            kind: 'loaded',
            bundle: previewBundleFixture,
        });
    });

    it('returns recovery details and logs the cause when the generated bundle is absent', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
        const cause = new Error('missing module');

        await expect(loadPreviewBundle(async () => Promise.reject(cause))).resolves.toEqual(
            rejection('missing', ''),
        );

        expect(warn).toHaveBeenCalledWith('Preview bundle could not be imported', cause);
        warn.mockRestore();
    });
});
