import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;

const mocks = vi.hoisted(() => ({
    getJournal: vi.fn(),
    toastError: vi.fn(),
}));

vi.mock('../../../src/common/api/.generated', async (importOriginal) => ({
    ...(await importOriginal<typeof import('../../../src/common/api/.generated')>()),
    getJournal: mocks.getJournal,
}));

vi.mock('../../../src/common/services/ToastService', () => ({
    ToastService: {
        error: mocks.toastError,
    },
}));

import JournalComponent from '../../../src/views/journal/JournalComponent';

let container: HTMLDivElement;
let root: Root;

describe('JournalComponent loading', () => {
    beforeEach(() => {
        mocks.getJournal.mockReset();
        mocks.toastError.mockReset();
        container = document.createElement('div');
        document.body.append(container);
        root = createRoot(container);
    });

    afterEach(async () => {
        await act(async () => root.unmount());
        container.remove();
    });

    it('shows a retryable error and recovers after a failed request', async () => {
        mocks.getJournal
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValueOnce([]);

        await act(async () => {
            root.render(<JournalComponent />);
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(container.textContent).toContain('Unable to load journal.');
        expect(container.textContent).toContain('Try again');
        expect(mocks.toastError).toHaveBeenCalledWith({ message: 'Unable to load journal.' });

        const retry = container.querySelector('button');
        if (!retry) {
            throw new Error('Retry button was not rendered');
        }
        await act(async () => {
            retry.click();
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(container.textContent).toContain('In Progress');
        expect(container.textContent).not.toContain('Unable to load journal.');
        expect(mocks.getJournal).toHaveBeenCalledTimes(2);
    });
});
