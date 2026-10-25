import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NpcDto } from '../../../src/common/api/.generated';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;

type Deferred<T> = {
    promise: Promise<T>;
    resolve: (value: T) => void;
    reject: (reason: unknown) => void;
};

function deferred<T>(): Deferred<T> {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((resolvePromise, rejectPromise) => {
        resolve = resolvePromise;
        reject = rejectPromise;
    });
    return { promise, resolve, reject };
}

const mocks = vi.hoisted(() => ({
    completeDialogue: vi.fn(),
    getNpc: vi.fn(),
    npcName: 'prologue:npc/martha',
    toastError: vi.fn(),
    applyGameOutcome: vi.fn(),
}));

vi.mock('../../../src/common/api/.generated', () => ({
    getNpc: mocks.getNpc,
    completeDialogue: mocks.completeDialogue,
}));

vi.mock('../../../src/views/game/GameStore', () => ({
    useGameStore: () => ({
        npcName: mocks.npcName,
        setView: vi.fn(),
    }),
}));

vi.mock('../../../src/common/services/ToastService', () => ({
    ToastService: {
        error: mocks.toastError,
    },
}));

vi.mock('../../../src/common/services/gameOutcome', () => ({
    applyGameOutcome: mocks.applyGameOutcome,
}));

import DialogueComponent from '../../../src/views/dialogue/DialogueComponent';

const npc = (label: string, title: string, text: string): NpcDto =>
    ({
        label,
        title,
        dialogue: {
            id: `prologue:dialogue/${label.toLowerCase()}`,
            revision: 'revision-1',
            startNodeId: 'opening',
            nodes: [
                {
                    id: 'opening',
                    kind: 'line',
                    text,
                    speaker: {
                        kind: 'npc',
                        npcId: `prologue:npc/${label.toLowerCase()}`,
                        label,
                    },
                    next: { kind: 'end' },
                },
            ],
        },
    }) satisfies NpcDto;

let container: HTMLDivElement;
let root: Root;

async function mount(): Promise<void> {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
        root.render(<DialogueComponent />);
    });
}

describe('DialogueComponent loading', () => {
    beforeEach(() => {
        mocks.getNpc.mockReset();
        mocks.completeDialogue.mockReset();
        mocks.toastError.mockReset();
        mocks.applyGameOutcome.mockReset().mockResolvedValue({ refreshed: true });
        mocks.npcName = 'prologue:npc/martha';
    });

    afterEach(async () => {
        if (root) {
            await act(async () => root.unmount());
        }
        container?.remove();
    });

    it('shows a retryable error instead of remaining loading', async () => {
        mocks.getNpc
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValueOnce(npc('Martha', 'Inn Keeper', 'Welcome.'));
        await mount();

        expect(container.textContent).toContain('Unable to load dialogue.');
        expect(container.textContent).toContain('Try again');
        expect(mocks.toastError).not.toHaveBeenCalled();

        const retry = Array.from(container.querySelectorAll('button')).find(
            (button) => button.textContent === 'Try again',
        );
        if (!retry) {
            throw new Error('Retry button was not rendered');
        }
        expect(retry).toBe(document.activeElement);
        expect(container.querySelector('[role="status"]')?.textContent).toBe(
            'Unable to load dialogue.',
        );
        await act(async () => {
            retry.click();
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(container.textContent).toContain('Inn Keeper');
        expect(container.textContent).toContain('Martha: Welcome.');
        expect(mocks.getNpc).toHaveBeenCalledTimes(2);
    });

    it('renders line artwork separately from the speaker portrait', async () => {
        mocks.getNpc.mockResolvedValue({
            label: 'Vargoth',
            title: 'Stranger',
            dialogue: {
                id: 'prologue:dialogue/vargoth',
                revision: 'revision-1',
                startNodeId: 'opening',
                nodes: [
                    {
                        id: 'opening',
                        kind: 'line',
                        text: 'The vessel glows.',
                        speaker: {
                            kind: 'npc',
                            npcId: 'prologue:npc/vargoth',
                            label: 'Vargoth',
                            imageUri: 'story/gen-vargoth.png',
                        },
                        imageUri: 'story/bracelet-vessel.png',
                        next: { kind: 'end' },
                    },
                ],
            },
        } satisfies NpcDto);
        await mount();

        const images = Array.from(container.querySelectorAll('img'));
        expect(images).toHaveLength(2);
        expect(images[0]?.getAttribute('alt')).toBe('Vargoth');
        expect(images[0]?.getAttribute('src')).toContain('story/gen-vargoth.png');
        expect(images[1]?.getAttribute('src')).toContain('story/bracelet-vessel.png');
        expect(container.textContent).toContain('Stranger');
        expect(container.textContent).toContain('Vargoth: The vessel glows.');
    });

    it('ignores a stale NPC response and preserves title and speaker identity', async () => {
        const staleRequest = deferred<NpcDto>();
        const currentRequest = deferred<NpcDto>();
        mocks.npcName = 'prologue:npc/amol';
        mocks.getNpc
            .mockReturnValueOnce(staleRequest.promise)
            .mockReturnValueOnce(currentRequest.promise);
        await mount();

        mocks.npcName = 'prologue:npc/martha';
        await act(async () => {
            root.render(<DialogueComponent />);
        });
        expect(mocks.getNpc).toHaveBeenCalledTimes(2);

        await act(async () => {
            currentRequest.resolve(npc('Martha', 'Inn Keeper', 'Current line.'));
            await currentRequest.promise;
        });
        await act(async () => {
            staleRequest.resolve(npc('Elias', 'Herbalist', 'Stale line.'));
            await staleRequest.promise;
        });

        expect(container.textContent).toContain('Inn Keeper');
        expect(container.textContent).toContain('Martha: Current line.');
        expect(container.textContent).not.toContain('Herbalist');
        expect(container.textContent).not.toContain('Stale line.');
    });

    it('locks choice changes after a failed completion and retries the same run', async () => {
        mocks.getNpc.mockResolvedValue({
            label: 'Martha',
            title: 'Inn Keeper',
            dialogue: {
                id: 'prologue:dialogue/martha',
                revision: 'revision-1',
                startNodeId: 'choice',
                nodes: [
                    {
                        id: 'choice',
                        kind: 'choice',
                        text: 'Choose.',
                        speaker: { kind: 'npc', npcId: 'prologue:npc/martha', label: 'Martha' },
                        choices: [
                            { id: 'first', text: 'First', next: { kind: 'end' } },
                            { id: 'second', text: 'Second', next: { kind: 'end' } },
                        ],
                    },
                ],
            },
        } satisfies NpcDto);
        mocks.completeDialogue
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValueOnce({ events: [] });
        await mount();

        const firstChoice = Array.from(container.querySelectorAll('button')).find(
            (button) => button.textContent === '1: First',
        );
        if (!firstChoice) {
            throw new Error('First choice was not rendered');
        }
        await act(async () => {
            firstChoice.click();
            await Promise.resolve();
        });

        expect(container.textContent).toContain('Retry');
        expect(container.textContent).not.toContain('2: Second');
        expect(mocks.toastError).not.toHaveBeenCalled();
        expect(mocks.completeDialogue).toHaveBeenCalledWith(
            expect.objectContaining({ choicePath: ['first'] }),
        );
        const wrapper = container.querySelector('[tabindex="-1"]');
        if (!wrapper) {
            throw new Error('Dialogue wrapper was not rendered');
        }
        await act(async () => {
            wrapper.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: '1' }));
            wrapper.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }));
            wrapper.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
        });
        expect(mocks.completeDialogue).toHaveBeenCalledOnce();

        const retry = Array.from(container.querySelectorAll('button')).find(
            (button) => button.textContent === 'Retry',
        );
        if (!retry) {
            throw new Error('Retry button was not rendered');
        }
        await act(async () => {
            retry.click();
            await Promise.resolve();
        });

        expect(mocks.completeDialogue).toHaveBeenCalledTimes(2);
        expect(mocks.completeDialogue).toHaveBeenLastCalledWith(
            expect.objectContaining({ choicePath: ['first'] }),
        );
    });

    it('submits a keyboard completion once while its request is pending', async () => {
        const completion = deferred<{ events: [] }>();
        mocks.getNpc.mockResolvedValue(npc('Martha', 'Inn Keeper', 'Welcome.'));
        mocks.completeDialogue.mockReturnValueOnce(completion.promise);
        await mount();

        const wrapper = container.querySelector('[tabindex="-1"]');
        if (!wrapper) {
            throw new Error('Dialogue wrapper was not rendered');
        }
        await act(async () => {
            wrapper.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
            wrapper.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: ' ' }));
            await Promise.resolve();
        });

        expect(mocks.completeDialogue).toHaveBeenCalledOnce();

        await act(async () => {
            completion.resolve({ events: [] });
            await completion.promise;
        });
    });

    it('reloads a chained dialogue for the same NPC after completion', async () => {
        mocks.getNpc
            .mockResolvedValueOnce(npc('Martha', 'Inn Keeper', 'First line.'))
            .mockResolvedValueOnce(npc('Martha', 'Inn Keeper', 'Follow-up line.'));
        mocks.completeDialogue.mockResolvedValueOnce({
            events: [
                {
                    kind: 'dialogue-opened',
                    npcId: 'prologue:npc/martha',
                    label: 'Martha',
                    dialogueId: 'prologue:dialogue/martha-follow-up',
                    startNodeId: 'opening',
                },
            ],
        });
        await mount();

        const complete = Array.from(container.querySelectorAll('button')).find(
            (button) => button.textContent === 'OK',
        );
        if (!complete) {
            throw new Error('Dialogue completion button was not rendered');
        }
        await act(async () => {
            complete.click();
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(mocks.applyGameOutcome).toHaveBeenCalledOnce();
        expect(mocks.getNpc).toHaveBeenCalledTimes(2);
        expect(container.textContent).toContain('Follow-up line.');
    });
});
