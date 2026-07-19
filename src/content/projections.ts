import {
    isPreviewContentCommandArray,
    traceCommands,
    type CommandEventTrace,
} from './commandTrace';
import type { JsonObject, PreviewBundle, PreviewCatalog } from './types';

export type DialogueSpeakerProjection = Readonly<{
    kind: 'player' | 'narrator' | 'character' | 'npc';
    label: string;
    reference?: string;
}>;

export type DialogueEdgeProjection = Readonly<{
    target: string;
}>;

export type DialogueChoiceProjection = Readonly<{
    id: string;
    text: string;
    next: DialogueEdgeProjection;
    conditionSummary?: string;
    commandTraces: readonly CommandEventTrace[];
}>;

export type DialogueNodeProjection = Readonly<{
    id: string;
    kind: 'line' | 'choice';
    speaker: DialogueSpeakerProjection;
    text: string;
    imageUri?: string;
    next?: DialogueEdgeProjection;
    choices?: readonly DialogueChoiceProjection[];
}>;

export type DialogueDiagnostic = Readonly<{
    code: 'unreachable' | 'non-terminating';
    nodeId: string;
    message: string;
}>;

export type DialogueGraphProjection = Readonly<{
    dialogueId: string;
    startNodeId: string;
    nodes: readonly DialogueNodeProjection[];
    completionCommandTraces: readonly CommandEventTrace[];
    diagnostics: readonly DialogueDiagnostic[];
}>;

export type NpcDialoguePriorityProjection = Readonly<{
    dialogueId: string;
    conditionSummary: string;
    order: number;
}>;

export type NpcDialogueFallbackProjection =
    | Readonly<{
          kind: 'fixed';
          dialogueId: string;
      }>
    | Readonly<{
          kind: 'random';
          dialogueIds: readonly string[];
      }>;

export type NpcDialogueProjection = Readonly<{
    npcId: string;
    label: string;
    title?: string;
    priority: readonly NpcDialoguePriorityProjection[];
    fallback: NpcDialogueFallbackProjection;
}>;

export type QuestGoalProjection = Readonly<{
    id: string;
    kind: string;
    label: string;
    target: number;
    reference: string;
}>;

export type QuestStageProjection = Readonly<{
    stageId: string;
    objective: string;
    description: string;
    goals: readonly QuestGoalProjection[];
}>;

export type QuestTransitionProjection = Readonly<{
    transitionId: string;
    kind: string;
    summary: string;
    lifecycleEffect: string;
    conditionSummary?: string;
    commandTraces: readonly CommandEventTrace[];
}>;

export type QuestProjection = Readonly<{
    questId: string;
    label: string;
    journalHint: string;
    initialStageId: string;
    main: boolean;
    lifecycleStates: readonly string[];
    stages: readonly QuestStageProjection[];
    transitions: readonly QuestTransitionProjection[];
}>;

export type SceneEntityProjection = Readonly<{
    kind: 'npc' | 'passage' | 'geometry';
    x: number;
    y: number;
    label: string;
}>;

export type SceneEncounterOverlayProjection = Readonly<{
    encounterId: string;
    position: Readonly<{ x: number; y: number }>;
    conditionSummary: string;
}>;

export type SceneProjection = Readonly<{
    sceneId: string;
    label: string;
    columns: number;
    rows: number;
    tileSize: number;
    tileCount: number;
    entities: readonly SceneEntityProjection[];
    overlays: readonly SceneEncounterOverlayProjection[];
}>;

const asString = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);

const requiredString = (value: unknown, description: string): string => {
    if (typeof value !== 'string' || value.length === 0) {
        throw new Error(`Missing ${description}`);
    }
    return value;
};

const asNumber = (value: unknown, fallback = 0): number =>
    typeof value === 'number' ? value : fallback;

const asCommands = (value: unknown): Parameters<typeof traceCommands>[0] =>
    isPreviewContentCommandArray(value) ? value : [];

const projectEdge = (edge: JsonObject | undefined): DialogueEdgeProjection => {
    if (!edge || edge.kind === 'end') {
        return { target: 'end' };
    }
    return { target: asString(edge.nodeId) };
};

export const summarizeCondition = (condition: unknown): string => {
    if (!condition || typeof condition !== 'object') {
        return 'always';
    }
    const record = condition as JsonObject;
    const kind = asString(record.kind, 'unknown');
    switch (kind) {
        case 'always':
            return `always=${String(record.value)}`;
        case 'flag':
            return `flag ${asString(record.flagId)} ${asString(record.operator)} ${String(record.value)}`;
        case 'quest-status':
            return `quest-status ${asString(record.questId)} ${asString(record.status)}`;
        case 'quest-current-stage':
            return `quest-current-stage ${asString(record.questId)} ${asString(record.stageId)}`;
        case 'quest-stage-status':
            return `quest-stage-status ${asString(record.questId)} ${asString(record.stageId)} ${asString(record.status)}`;
        case 'quest-goal-complete':
            return `quest-goal-complete ${asString(record.questId)} ${asString(record.stageId)} ${asString(record.goalId)}`;
        case 'item-count':
            return `item-count ${asString(record.itemId)} ${asString(record.operator)} ${String(record.quantity)}`;
        case 'main-character-class':
            return `main-character-class ${asString(record.characterClass)}`;
        case 'roster-has-character':
            return `roster-has-character ${asString(record.characterId)}`;
        case 'active-party-has-character':
            return `active-party-has-character ${asString(record.characterId)}`;
        case 'resolver':
            return `resolver ${asString(record.name)}`;
        case 'all':
        case 'any':
        case 'not':
            return kind;
        default:
            return kind;
    }
};

export const projectSpeaker = (
    speakerValue: unknown,
    catalog: PreviewCatalog,
): DialogueSpeakerProjection => {
    if (!speakerValue || typeof speakerValue !== 'object') {
        return { kind: 'narrator', label: 'narrator' };
    }
    const speaker = speakerValue as JsonObject;
    const kind = asString(speaker.kind);
    switch (kind) {
        case 'player':
            return { kind: 'player', label: 'player' };
        case 'narrator':
            return { kind: 'narrator', label: 'narrator' };
        case 'character': {
            const reference = asString(speaker.characterId);
            return { kind: 'character', label: reference, reference };
        }
        case 'npc': {
            const reference = asString(speaker.npcId);
            const npc = catalog.npc[reference];
            return {
                kind: 'npc',
                label: requiredString(npc?.label, `label for NPC "${reference}"`),
                reference,
            };
        }
        default:
            return { kind: 'narrator', label: kind || 'unknown' };
    }
};

const collectOutgoingTargets = (node: JsonObject): readonly string[] => {
    if (node.kind === 'line') {
        const next = node.next as JsonObject | undefined;
        return next?.kind === 'node' ? [asString(next.nodeId)] : [];
    }
    if (node.kind === 'choice') {
        const choices = Array.isArray(node.choices) ? node.choices : [];
        return choices
            .map((choice) => {
                const next = (choice as JsonObject).next as JsonObject | undefined;
                return next?.kind === 'node' ? asString(next.nodeId) : undefined;
            })
            .filter((target): target is string => !!target);
    }
    return [];
};

const canReachEnd = (
    nodeId: string,
    nodesById: ReadonlyMap<string, JsonObject>,
    visiting: ReadonlySet<string>,
    memo: Map<string, boolean>,
): boolean => {
    if (memo.has(nodeId)) {
        return memo.get(nodeId) ?? false;
    }
    if (visiting.has(nodeId)) {
        return false;
    }
    const node = nodesById.get(nodeId);
    if (!node) {
        return false;
    }
    const nextVisiting = new Set(visiting);
    nextVisiting.add(nodeId);
    let result = false;
    if (node.kind === 'line') {
        const next = node.next as JsonObject | undefined;
        result = next?.kind === 'end' ? true : canReachEnd(asString(next?.nodeId), nodesById, nextVisiting, memo);
    } else if (node.kind === 'choice') {
        const choices = Array.isArray(node.choices) ? node.choices : [];
        result =
            choices.length > 0 &&
            choices.every((choice) => {
                const next = (choice as JsonObject).next as JsonObject | undefined;
                return next?.kind === 'end'
                    ? true
                    : canReachEnd(asString(next?.nodeId), nodesById, nextVisiting, memo);
            });
    }
    memo.set(nodeId, result);
    return result;
};

const buildDialogueDiagnostics = (
    startNodeId: string,
    nodesById: ReadonlyMap<string, JsonObject>,
): readonly DialogueDiagnostic[] => {
    const reachable = new Set<string>();
    const queue = [startNodeId];
    while (queue.length > 0) {
        const nodeId = queue.shift();
        if (!nodeId || reachable.has(nodeId)) {
            continue;
        }
        const node = nodesById.get(nodeId);
        if (!node) {
            continue;
        }
        reachable.add(nodeId);
        for (const target of collectOutgoingTargets(node)) {
            if (!reachable.has(target)) {
                queue.push(target);
            }
        }
    }
    const diagnostics: DialogueDiagnostic[] = [];
    for (const nodeId of nodesById.keys()) {
        if (!reachable.has(nodeId)) {
            diagnostics.push({
                code: 'unreachable',
                nodeId,
                message: `Node "${nodeId}" is not reachable from start "${startNodeId}".`,
            });
        }
    }
    const memo = new Map<string, boolean>();
    for (const nodeId of reachable) {
        if (!canReachEnd(nodeId, nodesById, new Set(), memo)) {
            diagnostics.push({
                code: 'non-terminating',
                nodeId,
                message: `Node "${nodeId}" has no path to an explicit end.`,
            });
        }
    }
    return diagnostics;
};

export const projectDialogueGraph = (
    dialogue: JsonObject,
    catalog: PreviewCatalog,
): DialogueGraphProjection => {
    const nodes = Array.isArray(dialogue.nodes) ? dialogue.nodes : [];
    const nodesById = new Map(
        nodes
            .filter((nodeValue): nodeValue is JsonObject => !!nodeValue && typeof nodeValue === 'object')
            .map((node) => [asString(node.id), node]),
    );
    const startNodeId = asString(dialogue.startNodeId);
    const projectedNodes = nodes.map((nodeValue) => {
        const node = nodeValue as JsonObject;
        const kind = node.kind === 'choice' ? 'choice' : 'line';
        const base = {
            id: asString(node.id),
            kind,
            speaker: projectSpeaker(node.speaker, catalog),
            text: asString(node.text),
            imageUri: typeof node.imageUri === 'string' ? node.imageUri : undefined,
        } as const;
        if (kind === 'line') {
            return {
                ...base,
                next: projectEdge(node.next as JsonObject | undefined),
            };
        }
        const choices = Array.isArray(node.choices) ? node.choices : [];
        return {
            ...base,
            choices: choices.map((choiceValue) => {
                const choice = choiceValue as JsonObject;
                return {
                    id: asString(choice.id),
                    text: asString(choice.text),
                    next: projectEdge(choice.next as JsonObject | undefined),
                    conditionSummary: choice.condition ? summarizeCondition(choice.condition) : undefined,
                    commandTraces: traceCommands(asCommands(choice.commands)),
                };
            }),
        };
    });
    return {
        dialogueId: asString(dialogue.id),
        startNodeId,
        nodes: projectedNodes,
        completionCommandTraces: traceCommands(asCommands(dialogue.completionCommands)),
        diagnostics: buildDialogueDiagnostics(startNodeId, nodesById),
    };
};

const projectNpcDialogueFallback = (fallbackValue: unknown): NpcDialogueFallbackProjection => {
    const fallback = fallbackValue as JsonObject;
    const kind = asString(fallback.kind);
    if (kind === 'random') {
        const dialogueIds = Array.isArray(fallback.dialogueIds)
            ? fallback.dialogueIds.map((dialogueId) => requiredString(dialogueId, 'random fallback dialogueId'))
            : [];
        return { kind: 'random', dialogueIds };
    }
    return {
        kind: 'fixed',
        dialogueId: requiredString(fallback.dialogueId, 'fixed fallback dialogueId'),
    };
};

export const projectNpcDialogues = (catalog: PreviewCatalog): readonly NpcDialogueProjection[] =>
    Object.entries(catalog.npc).map(([npcId, npc]) => {
        const selection = npc.dialogues as JsonObject;
        const priorityEntries = Array.isArray(selection.priority) ? selection.priority : [];
        const priority = priorityEntries.map((entryValue, index) => {
            const entry = entryValue as JsonObject;
            return {
                dialogueId: requiredString(entry.dialogueId, `priority dialogueId for NPC "${npcId}"`),
                conditionSummary: summarizeCondition(entry.condition),
                order: index + 1,
            };
        });
        return {
            npcId,
            label: requiredString(npc.label, `label for NPC "${npcId}"`),
            title: typeof npc.title === 'string' ? npc.title : undefined,
            priority,
            fallback: projectNpcDialogueFallback(selection.fallback),
        };
    });

const summarizeTransition = (
    transition: JsonObject,
): Readonly<{ summary: string; lifecycleEffect: string }> => {
    const kind = asString(transition.kind);
    switch (kind) {
        case 'start':
            return {
                summary: `start -> ${asString(transition.toStageId)}`,
                lifecycleEffect: `hidden -> active (${asString(transition.toStageId)})`,
            };
        case 'advance':
            return {
                summary: `${asString(transition.fromStageId)} -> ${asString(transition.toStageId)}`,
                lifecycleEffect: `active ${asString(transition.fromStageId)} -> ${asString(transition.toStageId)}`,
            };
        case 'hold':
            return {
                summary: `hold ${asString(transition.stageId)}`,
                lifecycleEffect: `active -> on-hold (${asString(transition.stageId)})`,
            };
        case 'resume':
            return {
                summary: `resume ${asString(transition.stageId)}`,
                lifecycleEffect: `on-hold -> active (${asString(transition.stageId)})`,
            };
        case 'complete':
            return {
                summary: `complete from ${asString(transition.fromStageId)}`,
                lifecycleEffect: `active -> completed (${asString(transition.fromStageId)})`,
            };
        case 'fail':
            return {
                summary: `fail ${asString(transition.stageId)} from ${asString(transition.fromStatus)}`,
                lifecycleEffect: `${asString(transition.fromStatus)} -> failed (${asString(transition.stageId)})`,
            };
        default:
            return { summary: kind, lifecycleEffect: kind };
    }
};

export const projectQuest = (quest: JsonObject): QuestProjection => {
    const stages = Array.isArray(quest.stages) ? quest.stages : [];
    const transitions = Array.isArray(quest.transitions) ? quest.transitions : [];
    return {
        questId: asString(quest.id),
        label: asString(quest.label),
        journalHint: asString(quest.journalHint),
        initialStageId: asString(quest.initialStageId),
        main: quest.main === true,
        lifecycleStates: ['hidden', 'discovered', 'active', 'on-hold', 'completed', 'failed'],
        stages: stages.map((stageValue) => {
            const stage = stageValue as JsonObject;
            const goals = Array.isArray(stage.goals) ? stage.goals : [];
            return {
                stageId: asString(stage.id),
                objective: asString(stage.objective),
                description: asString(stage.description),
                goals: goals.map((goalValue) => {
                    const goal = goalValue as JsonObject;
                    const kind = asString(goal.kind);
                    const reference =
                        kind === 'item'
                            ? asString(goal.itemId)
                            : kind === 'enemy'
                              ? asString(goal.enemyId)
                              : asString(goal.encounterId);
                    return {
                        id: asString(goal.id),
                        kind,
                        label: asString(goal.label),
                        target: asNumber(goal.target),
                        reference,
                    };
                }),
            };
        }),
        transitions: transitions.map((transitionValue) => {
            const transition = transitionValue as JsonObject;
            const { summary, lifecycleEffect } = summarizeTransition(transition);
            return {
                transitionId: asString(transition.id),
                kind: asString(transition.kind),
                summary,
                lifecycleEffect,
                conditionSummary: transition.condition ? summarizeCondition(transition.condition) : undefined,
                commandTraces: traceCommands(asCommands(transition.commands)),
            };
        }),
    };
};

export const projectScene = (sceneId: string, scene: JsonObject, catalog: PreviewCatalog): SceneProjection => {
    const tiles = Array.isArray(scene.tiles) ? scene.tiles : [];
    const entities: SceneEntityProjection[] = [];
    for (const tileValue of tiles) {
        const tile = tileValue as JsonObject;
        const position = tile.position as JsonObject | undefined;
        const x = typeof position?.x === 'number' ? position.x : 0;
        const y = typeof position?.y === 'number' ? position.y : 0;
        const type = asString(tile.type);
        if (type === 'Npc') {
            const npcId = asString(tile.npcId);
            entities.push({
                kind: 'npc',
                x,
                y,
                label: requiredString(
                    catalog.npc[npcId]?.label,
                    `label for NPC "${npcId}"`,
                ),
            });
            continue;
        }
        if (type === 'Passage') {
            entities.push({ kind: 'passage', x, y, label: asString(tile.targetSceneId) });
            continue;
        }
        entities.push({ kind: 'geometry', x, y, label: type });
    }
    const overlays = catalog.encounterOverlay
        .filter((overlay) => asString(overlay.sceneId) === sceneId)
        .map((overlay) => {
            const position = overlay.position as JsonObject | undefined;
            return {
                encounterId: asString(overlay.encounterId),
                position: {
                    x: typeof position?.x === 'number' ? position.x : 0,
                    y: typeof position?.y === 'number' ? position.y : 0,
                },
                conditionSummary: summarizeCondition(overlay.displayCondition),
            };
        });
    return {
        sceneId,
        label: sceneId.split('/').pop() ?? sceneId,
        columns: typeof scene.columns === 'number' ? scene.columns : 0,
        rows: typeof scene.rows === 'number' ? scene.rows : 0,
        tileSize: typeof scene.tileSize === 'number' ? scene.tileSize : 10,
        tileCount: tiles.length,
        entities,
        overlays,
    };
};

export const listCatalogIds = (catalog: PreviewCatalog, kind: keyof PreviewCatalog): readonly string[] => {
    if (kind === 'encounterOverlay') {
        return catalog.encounterOverlay.map((overlay) => asString(overlay.encounterId));
    }
    const bucket = catalog[kind];
    if (!bucket || typeof bucket !== 'object' || Array.isArray(bucket)) {
        return [];
    }
    return Object.keys(bucket).sort();
};

export const projectBundleSummary = (bundle: PreviewBundle): Readonly<{
    sourceHash: string;
    packNames: readonly string[];
    counts: PreviewBundle['report']['counts'];
    issueCount: number;
    assetCount: number;
}> => ({
    sourceHash: bundle.sourceHash,
    packNames: bundle.packs.map((pack) => pack.name),
    counts: bundle.report.counts,
    issueCount: bundle.report.issues.length,
    assetCount: bundle.report.assets.references.length,
});
