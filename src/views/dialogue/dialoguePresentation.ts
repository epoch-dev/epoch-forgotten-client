import type {
    DialogueEdgeDto,
    DialoguePresentationDto,
    DialoguePresentationNodeDto,
    DialogueSpeakerDto,
} from '../../common/api/.generated';
import { AssetsService } from '../../common/services/AssetsService';
import type { DialogueGraph, DialogueGraphEdge, DialogueGraphNode, DialogueGraphSpeaker } from './dialogueGraph';

function mapEdge(edge: DialogueEdgeDto): DialogueGraphEdge {
    switch (edge.kind) {
        case 'end':
            return { kind: 'end' };
        case 'node':
            return { kind: 'node', nodeId: edge.nodeId };
        default: {
            const exhaustive: never = edge;
            throw new Error(`Unknown dialogue edge: ${JSON.stringify(exhaustive)}`);
        }
    }
}

function mapSpeaker(speaker: DialogueSpeakerDto): DialogueGraphSpeaker {
    switch (speaker.kind) {
        case 'player':
            return {
                kind: 'player',
                label: speaker.label,
                imageUri: speaker.imageUri,
            };
        case 'narrator':
            return { kind: 'narrator' };
        case 'character':
            if (!speaker.label) {
                throw new Error('Dialogue character speaker is missing label');
            }
            return {
                kind: 'character',
                characterId: speaker.characterId,
                label: speaker.label,
                imageUri: speaker.imageUri,
            };
        case 'npc':
            if (!speaker.label) {
                throw new Error('Dialogue npc speaker is missing label');
            }
            return {
                kind: 'npc',
                npcId: speaker.npcId,
                label: speaker.label,
                imageUri: speaker.imageUri,
            };
        default: {
            const exhaustive: never = speaker;
            throw new Error(`Unknown dialogue speaker kind: ${JSON.stringify(exhaustive)}`);
        }
    }
}

function mapNode(node: DialoguePresentationNodeDto): DialogueGraphNode {
    switch (node.kind) {
        case 'line':
            return {
                kind: 'line',
                id: node.id,
                speaker: mapSpeaker(node.speaker),
                text: node.text,
                imageUri: node.imageUri,
                next: mapEdge(node.next),
            };
        case 'choice':
            return {
                kind: 'choice',
                id: node.id,
                speaker: mapSpeaker(node.speaker),
                text: node.text,
                choices: node.choices.map((choice) => ({
                    id: choice.id,
                    text: choice.text,
                    next: mapEdge(choice.next),
                })),
            };
        default: {
            const exhaustive: never = node;
            throw new Error(`Unknown dialogue node kind: ${JSON.stringify(exhaustive)}`);
        }
    }
}

export function toDialogueGraph(presentation: DialoguePresentationDto): DialogueGraph {
    return {
        id: presentation.id,
        revision: presentation.revision,
        startNodeId: presentation.startNodeId,
        nodes: presentation.nodes.map(mapNode),
    };
}

export function getSpeakerLabel(speaker: DialogueGraphSpeaker): string {
    switch (speaker.kind) {
        case 'narrator':
            return '';
        case 'player':
        case 'character':
        case 'npc':
            return speaker.label;
        default: {
            const exhaustive: never = speaker;
            throw new Error(`Unknown dialogue speaker: ${JSON.stringify(exhaustive)}`);
        }
    }
}

export function getSpeakerImageUri(speaker: DialogueGraphSpeaker): string | undefined {
    switch (speaker.kind) {
        case 'narrator':
            return undefined;
        case 'player':
        case 'character':
        case 'npc':
            return speaker.imageUri;
        default: {
            const exhaustive: never = speaker;
            throw new Error(`Unknown dialogue speaker: ${JSON.stringify(exhaustive)}`);
        }
    }
}

export function getLineImageUrl(imageUri: string): string {
    return AssetsService.getCharacterUri(imageUri);
}
