import { describe, expect, it, vi } from 'vitest';
import { runExclusive } from '../../src/common/runExclusive';

describe('runExclusive', () => {
    it('runs one operation while the current operation is pending', async () => {
        let resolveFirst!: () => void;
        const firstOperation = vi.fn(
            () =>
                new Promise<void>((resolve) => {
                    resolveFirst = resolve;
                }),
        );
        const secondOperation = vi.fn(async () => undefined);
        const guard = { current: false };

        const first = runExclusive(guard, firstOperation);
        const second = await runExclusive(guard, secondOperation);

        expect(second).toBeUndefined();
        expect(firstOperation).toHaveBeenCalledOnce();
        expect(secondOperation).not.toHaveBeenCalled();

        resolveFirst();
        await first;
        await runExclusive(guard, secondOperation);

        expect(secondOperation).toHaveBeenCalledOnce();
    });
});
