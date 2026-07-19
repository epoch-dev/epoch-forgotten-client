import { describe, expect, it } from 'vitest';

describe('Content Lab route module', () => {
    it('exports a lazy-loadable route component', async () => {
        const module = await import('../../../src/views/content-lab/ContentLabRoute');
        expect(module.default).toBeTypeOf('function');
    });
});
