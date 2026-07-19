import { act, StrictMode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type {
    BattleDefeatResults,
    BattleVictoryRewards,
    GameEventDto,
} from '../../../src/common/api/.generated';
import { GameView } from '../../../src/views/game/types';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;

const mocks = vi.hoisted(() => ({
    callOrder: [] as string[],
    currentView: 2 as GameView,
    initialize: vi.fn(),
    loadScene: vi.fn(),
    present: vi.fn(),
    setView: vi.fn(),
}));

vi.mock('../../../src/views/game/GameStore', () => ({
    useGameStore: Object.assign(
        () => ({
            scene: { loadScene: mocks.loadScene },
            setView: mocks.setView,
        }),
        {
            getState: () => ({
                view: mocks.currentView,
                npcName: undefined,
                encounter: undefined,
                encounterName: undefined,
            }),
            setState: (
                update: (state: {
                    view: GameView;
                    npcName?: string;
                    encounter?: unknown;
                    encounterName?: string;
                }) => { view: GameView },
            ) => {
                mocks.currentView = update({ view: mocks.currentView }).view;
            },
        },
    ),
}));

vi.mock('../../../src/views/scenes/ScenesService', () => ({
    ScenesService: {
        initialize: mocks.initialize,
    },
}));

vi.mock('../../../src/common/services/GameEventHandler', () => ({
    GameEventHandler: {
        present: mocks.present,
    },
}));

import { BattleResultComponent } from '../../../src/views/battle/BattleResultComponent';

const victoryResults = (events: GameEventDto[] = []): BattleVictoryRewards => ({
    events,
    levels: [],
    items: [],
    gold: 10,
    exp: 20,
});

let container: HTMLDivElement;
let root: Root;

async function renderResult(
    props:
        | { victoryResults: BattleVictoryRewards; defeatResults?: undefined }
        | { victoryResults?: undefined; defeatResults: BattleDefeatResults },
    strict = false,
): Promise<void> {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
    await act(async () => {
        root.render(
            strict ? (
                <StrictMode>
                    <BattleResultComponent
                        victoryResults={props.victoryResults}
                        defeatResults={props.defeatResults}
                    />
                </StrictMode>
            ) : (
                <BattleResultComponent
                    victoryResults={props.victoryResults}
                    defeatResults={props.defeatResults}
                />
            ),
        );
    });
}

async function closeResult(): Promise<void> {
    const button = container.querySelector('button');
    if (!button) {
        throw new Error('Close button was not rendered');
    }
    await act(async () => {
        button.click();
        await Promise.resolve();
        await Promise.resolve();
    });
}

describe('BattleResultComponent', () => {
    beforeEach(() => {
        mocks.callOrder.length = 0;
        mocks.currentView = GameView.Party;
        mocks.initialize.mockReset().mockImplementation(async () => {
            mocks.callOrder.push('initialize');
        });
        mocks.loadScene.mockReset().mockImplementation(async () => {
            mocks.callOrder.push('loadScene');
        });
        mocks.present.mockReset().mockImplementation(async () => {
            mocks.callOrder.push('present');
        });
        mocks.setView.mockReset().mockImplementation((view: GameView) => {
            mocks.callOrder.push(`view:${view}`);
            mocks.currentView = view;
        });
    });

    afterEach(async () => {
        if (root) {
            await act(async () => root.unmount());
        }
        container?.remove();
    });

    it('waits for Close before presenting empty events and refreshes in order', async () => {
        await renderResult({ victoryResults: victoryResults() });

        expect(mocks.present).not.toHaveBeenCalled();
        expect(mocks.initialize).not.toHaveBeenCalled();

        await closeResult();

        expect(mocks.present).toHaveBeenCalledWith([]);
        expect(mocks.callOrder).toEqual([
            `view:${GameView.World}`,
            'present',
            'initialize',
            'loadScene',
        ]);
    });

    it('keeps chained dialogue navigation after scene refresh', async () => {
        const dialogueEvent = {
            kind: 'dialogue-opened',
            npcId: 'prologue:npc/martha',
            dialogueId: 'prologue:dialogue/martha',
            startNodeId: 'opening',
        } satisfies GameEventDto;
        mocks.present.mockImplementation(async () => {
            mocks.callOrder.push('present');
            mocks.currentView = GameView.Dialogue;
        });
        mocks.initialize.mockImplementation(async () => {
            mocks.callOrder.push('initialize');
            mocks.currentView = GameView.World;
        });

        await renderResult({ victoryResults: victoryResults([dialogueEvent]) });
        await closeResult();

        expect(mocks.present).toHaveBeenCalledWith([dialogueEvent]);
        expect(mocks.currentView).toBe(GameView.Dialogue);
        expect(mocks.initialize).toHaveBeenCalledAfter(mocks.present);
        expect(mocks.loadScene).toHaveBeenCalledAfter(mocks.initialize);
    });

    it('presents defeat events only after Close', async () => {
        const defeatEvent = {
            kind: 'dialogue-opened',
            npcId: 'prologue:npc/vargoth',
            dialogueId: 'prologue:dialogue/vargoth-defeat',
            startNodeId: 'opening',
        } satisfies GameEventDto;

        await renderResult({ defeatResults: { events: [defeatEvent] } });
        expect(mocks.present).not.toHaveBeenCalled();

        await closeResult();

        expect(mocks.present).toHaveBeenCalledWith([defeatEvent]);
        expect(container.textContent).toContain('Defeat');
    });

    it('presents events once across duplicate clicks and StrictMode', async () => {
        await renderResult({ victoryResults: victoryResults() }, true);
        const button = container.querySelector('button');
        if (!button) {
            throw new Error('Close button was not rendered');
        }

        await act(async () => {
            button.click();
            button.click();
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(mocks.present).toHaveBeenCalledTimes(1);
        expect(mocks.initialize).toHaveBeenCalledTimes(1);
        expect(mocks.loadScene).toHaveBeenCalledTimes(1);
    });
});
