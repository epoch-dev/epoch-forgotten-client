import { describe, expect, it } from 'vitest';
import {
    isPreviewContentCommand,
    isPreviewContentCommandArray,
    traceCommand,
} from '../../src/content/commandTrace';

describe('commandTrace', () => {
    it('describes grant-item without claiming runtime execution', () => {
        const trace = traceCommand({
            kind: 'grant-item',
            itemId: 'core:item/potion',
            quantity: 2,
        });
        expect(trace.commandSummary).toBe('grant-item core:item/potion x2');
        expect(trace.expectedEvents).toEqual(['item-granted (core:item/potion)']);
        expect(trace.note).toContain('Preview metadata only');
    });

    it('describes apply-quest-transition as a union of possible quest events', () => {
        const trace = traceCommand({
            kind: 'apply-quest-transition',
            questId: 'core:quest/tutorial',
            transitionId: 'begin-tutorial',
        });
        expect(trace.expectedEvents[0]).toContain('quest-started');
        expect(trace.note).toContain('transition definition');
    });

    it('recognizes every frozen command variant', () => {
        const commands = [
            { kind: 'grant-item', itemId: 'core:item/potion', quantity: 1 },
            {
                kind: 'recruit-character',
                characterId: 'core:character/main',
                level: 1,
                affinity: 0,
            },
            {
                kind: 'change-affinity',
                characterId: 'core:character/main',
                amount: 1,
            },
            { kind: 'start-encounter', encounterId: 'core:encounter/test' },
            { kind: 'open-dialogue', npcId: 'core:npc/innkeeper' },
            { kind: 'grant-gold', amount: 5 },
            { kind: 'grant-experience', amount: 10 },
            {
                kind: 'teleport',
                sceneId: 'core:scene/test',
                position: { x: 0, y: 0 },
            },
            { kind: 'set-flag', flagId: 'core:flag/test', value: true },
            { kind: 'discover-quest', questId: 'core:quest/tutorial' },
            {
                kind: 'apply-quest-transition',
                questId: 'core:quest/tutorial',
                transitionId: 'begin-tutorial',
            },
        ];

        expect(isPreviewContentCommandArray(commands)).toBe(true);
    });

    it('rejects unknown and malformed commands before tracing', () => {
        expect(isPreviewContentCommand({ kind: 'delete-save' })).toBe(false);
        expect(
            isPreviewContentCommand({
                kind: 'teleport',
                sceneId: 'core:scene/test',
                position: { x: '0', y: 0 },
            }),
        ).toBe(false);
        expect(
            isPreviewContentCommand({
                kind: 'set-flag',
                flagId: 'core:flag/test',
                value: { nested: true },
            }),
        ).toBe(false);
    });
});
