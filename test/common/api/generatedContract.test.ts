import { describe, expect, it } from 'vitest';
import type {
    DialogueEdgeDto,
    DialoguePresentationNodeDto,
    DialogueSpeakerDto,
    GameEventDto,
} from '../../../src/common/api/.generated';

describe('generated API contract', () => {
    it('accepts discriminated game event unions', () => {
        const events = [
            { kind: 'item-granted', itemId: 'core:item/potion', quantity: 1 },
            { kind: 'item-consumed', itemId: 'core:item/potion', quantity: 1 },
            { kind: 'dialogue-opened', npcId: 'prologue:npc/martha', dialogueId: 'd', startNodeId: 's' },
        ] satisfies GameEventDto[];

        expect(events).toHaveLength(3);
    });

    it('accepts discriminated dialogue speaker unions', () => {
        const speakers = [
            { kind: 'player', label: 'Rin' },
            { kind: 'narrator' },
            { kind: 'npc', npcId: 'prologue:npc/martha', label: 'Martha' },
            { kind: 'character', characterId: 'prologue:character/rin', label: 'Rin' },
        ] satisfies DialogueSpeakerDto[];

        expect(speakers).toHaveLength(4);
    });

    it('accepts discriminated dialogue edge unions', () => {
        const edges = [{ kind: 'end' }, { kind: 'node', nodeId: 'next' }] satisfies DialogueEdgeDto[];

        expect(edges).toHaveLength(2);
    });

    it('accepts line nodes with separate imageUri', () => {
        const node = {
            kind: 'line',
            id: 'opening',
            text: 'Welcome.',
            speaker: { kind: 'npc', npcId: 'prologue:npc/martha', label: 'Martha' },
            imageUri: 'story/main-1.png',
            next: { kind: 'end' },
        } satisfies DialoguePresentationNodeDto;

        expect(node.imageUri).toBe('story/main-1.png');
    });
});
