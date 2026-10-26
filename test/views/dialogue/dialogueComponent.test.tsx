import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { NpcDto } from '../../../src/common/api/.generated';
import { useGameStore } from '../../../src/views/game/GameStore';
import { GameView } from '../../../src/views/game/types';

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
    currentScene: vi.fn(),
    getNpc: vi.fn(),
    toastError: vi.fn(),
}));

vi.mock('../../../src/common/api/.generated', () => ({
    getNpc: mocks.getNpc,
    completeDialogue: mocks.completeDialogue,
    currentScene: mocks.currentScene,
}));

vi.mock('../../../src/common/services/ToastService', () => ({
    ToastService: {
        error: mocks.toastError,
    },
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

const choiceNpc = (): NpcDto => ({
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
});

let container: HTMLDivElement;
let root: Root;

const findButton = (text: string): HTMLButtonElement => {
    const button = Array.from(container.querySelectorAll('button')).find(
        (candidate) => candidate.textContent === text,
    );
    if (!button) {
        throw new Error(`Button "${text}" was not rendered`);
    }
    return button;
};

const clickAndSettle = async (button: HTMLButtonElement): Promise<void> => {
    await act(async () => {
        button.click();
        await new Promise((resolve) => setTimeout(resolve, 0));
    });
};

async function mount(npcName = 'prologue:npc/martha'): Promise<void> {
    useGameStore.setState({ view: GameView.Dialogue, npcName });
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
        mocks.currentScene.mockReset().mockResolvedValue({ userPosition: { x: 0, y: 0 } });
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
    });

    afterEach(async () => {
        if (root) {
            await act(async () => root.unmount());
        }
        container?.remove();
        vi.restoreAllMocks();
    });

    it('shows a retryable error instead of remaining loading', async () => {
        mocks.getNpc
            .mockRejectedValueOnce(new Error('offline'))
            .mockResolvedValueOnce(npc('Martha', 'Inn Keeper', 'Welcome.'));
        await mount();

        expect(container.textContent).toContain('Unable to load dialogue.');
        expect(container.textContent).toContain('Try again');
        expect(mocks.toastError).not.toHaveBeenCalled();

        const retry = findButton('Try again');
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
        mocks.getNpc
            .mockReturnValueOnce(staleRequest.promise)
            .mockReturnValueOnce(currentRequest.promise);
        await mount('prologue:npc/amol');

        await act(async () => {
            useGameStore.setState({ npcName: 'prologue:npc/martha' });
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

    it('locks choice changes after a failed completion and retries the same run to its outcome', async () => {
        mocks.getNpc
            .mockResolvedValueOnce(choiceNpc())
            .mockResolvedValueOnce(npc('Elias', 'Herbalist', 'Follow-up line.'));
        mocks.completeDialogue.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({
            events: [
                {
                    kind: 'dialogue-opened',
                    npcId: 'prologue:npc/elias',
                    label: 'Elias',
                    dialogueId: 'prologue:dialogue/elias',
                    startNodeId: 'opening',
                },
            ],
        });
        await mount();

        await clickAndSettle(findButton('1: First'));

        expect(container.textContent).not.toContain('2: Second');
        expect(mocks.toastError).not.toHaveBeenCalled();
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

        await clickAndSettle(findButton('Retry'));

        expect(mocks.completeDialogue).toHaveBeenCalledTimes(2);
        expect(mocks.completeDialogue).toHaveBeenLastCalledWith(
            expect.objectContaining({ choicePath: ['first'] }),
        );
        expect(useGameStore.getState()).toMatchObject({
            view: GameView.Dialogue,
            npcName: 'prologue:npc/elias',
        });
        expect(mocks.currentScene).toHaveBeenCalledOnce();
        expect(container.textContent).toContain('Elias: Follow-up line.');
        expect(container.textContent).not.toContain('Retry');
        expect(container.querySelector('[role="status"]')).toBeNull();
    });

    it('keeps Retry enabled and focused, described by the status, across repeated failures', async () => {
        const retryRequest = deferred<never>();
        mocks.getNpc.mockResolvedValue(choiceNpc());
        mocks.completeDialogue
            .mockRejectedValueOnce(new Error('offline'))
            .mockReturnValueOnce(retryRequest.promise);
        await mount();

        await clickAndSettle(findButton('1: First'));
        const retry = findButton('Retry');
        expect(document.activeElement).toBe(retry);

        await clickAndSettle(retry);
        await clickAndSettle(retry);

        // Browsers drop focus from a disabled button, so Retry must stay enabled while pending.
        expect(retry.disabled).toBe(false);
        expect(mocks.completeDialogue).toHaveBeenCalledTimes(2);

        await act(async () => {
            retryRequest.reject(new Error('offline'));
            await retryRequest.promise.catch(() => undefined);
        });

        expect(document.activeElement).toBe(retry);
        const statusId = retry.getAttribute('aria-describedby');
        expect(statusId).toBeTruthy();
        const status = container.querySelector('[role="status"]');
        expect(status?.id).toBe(statusId);
        expect(status?.textContent).toBe('Unable to complete dialogue. Try again.');
    });

    it('selects a choice by number key while a choice button has focus', async () => {
        mocks.getNpc.mockResolvedValue(choiceNpc());
        mocks.completeDialogue.mockReturnValue(new Promise(() => undefined));
        await mount();

        const firstChoice = findButton('1: First');
        firstChoice.focus();
        await act(async () => {
            firstChoice.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: '2' }));
        });

        expect(mocks.completeDialogue).toHaveBeenCalledOnce();
        expect(mocks.completeDialogue).toHaveBeenCalledWith(
            expect.objectContaining({ choicePath: ['second'] }),
        );
    });

    it('reloads the dialogue without applying an outcome when the completion is stale', async () => {
        mocks.getNpc
            .mockResolvedValueOnce(npc('Martha', 'Inn Keeper', 'Old line.'))
            .mockResolvedValueOnce(npc('Martha', 'Inn Keeper', 'Current line.'));
        mocks.completeDialogue.mockRejectedValueOnce(
            Object.assign(new Error('Conflict'), { isAxiosError: true, response: { status: 409 } }),
        );
        await mount();

        await clickAndSettle(findButton('OK'));

        expect(mocks.getNpc).toHaveBeenCalledTimes(2);
        expect(mocks.currentScene).not.toHaveBeenCalled();
        expect(container.textContent).toContain('Martha: Current line.');
        expect(container.querySelector('[role="status"]')).toBeNull();
        expect(useGameStore.getState().view).toBe(GameView.Dialogue);
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

        await clickAndSettle(findButton('OK'));

        expect(useGameStore.getState().view).toBe(GameView.Dialogue);
        expect(mocks.getNpc).toHaveBeenCalledTimes(2);
        expect(container.textContent).toContain('Follow-up line.');
    });
});
