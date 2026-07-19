import { describe, expect, it } from 'vitest';
import { buildPreviewRecoveryMessage, loadPreviewBundle, parsePreviewBundle } from '../../src/content/loader';
import { previewBundleFixture } from '../fixtures/previewBundle';

describe('preview loader', () => {
    it('parses a valid in-memory bundle', () => {
        const result = parsePreviewBundle(previewBundleFixture);
        expect(result.kind).toBe('loaded');
    });

    it('returns a direct sync command and diagnostic for invalid v3 bundles', () => {
        const result = parsePreviewBundle({ version: 3 });
        expect(result.kind).toBe('invalid');
        if (result.kind !== 'loaded') {
            expect(result.syncCommand).toBe('yarn content:sync-preview');
            expect(result.message).toContain('yarn content:sync-preview');
            expect(result.message).toContain('Missing or invalid sourceHash');
        }
    });

    it('rejects an otherwise valid v1 bundle explicitly as stale', () => {
        const result = parsePreviewBundle({
            ...previewBundleFixture,
            version: 1,
        });

        expect(result.kind).toBe('stale');
        if (result.kind === 'stale') {
            expect(result.syncCommand).toBe('yarn content:sync-preview');
            expect(result.message).toContain('Expected bundle version 3, got 1');
            expect(result.message).toContain('yarn content:sync-preview');
        }
    });

    it('rejects an otherwise valid v2 bundle explicitly as stale', () => {
        const result = parsePreviewBundle({
            ...previewBundleFixture,
            version: 2,
        });

        expect(result.kind).toBe('stale');
        if (result.kind === 'stale') {
            expect(result.syncCommand).toBe('yarn content:sync-preview');
            expect(result.message).toContain('Expected bundle version 3, got 2');
            expect(result.message).toContain('yarn content:sync-preview');
        }
    });

    it('builds recovery text with optional guard diagnostics', () => {
        expect(buildPreviewRecoveryMessage('yarn content:sync-preview', ['Dialogue missing startNodeId.'])).toContain(
            'Dialogue missing startNodeId.',
        );
    });

    it('returns recovery details when the generated bundle is absent', async () => {
        const result = await loadPreviewBundle(async () => Promise.reject(new Error('missing module')));
        expect(result.kind).toBe('missing');
        if (result.kind !== 'loaded') {
            expect(result.syncCommand).toBe('yarn content:sync-preview');
        }
    });
});
