import {
    CONTENT_KINDS,
    PREVIEW_BUNDLE_VERSION,
    type JsonObject,
    type JsonValue,
    type PreviewAssetCategory,
    type PreviewAssetReference,
    type PreviewIssue,
    type PreviewPack,
    type PreviewReport,
} from './types';
import { isPreviewContentCommandArray } from './commandTrace';

const SOURCE_HASH_PATTERN = /^[a-f0-9]{64}$/;

const LEGACY_DIALOGUE_FIELDS = ['author', 'targetNodeId', 'options'] as const;
const LEGACY_QUEST_FIELDS = ['state-change'] as const;

const isRecord = (value: JsonValue): value is JsonObject =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

const isStringArray = (value: JsonValue): value is readonly string[] =>
    Array.isArray(value) && value.every((entry) => typeof entry === 'string');

const isNumberRecord = (value: JsonValue, keys: readonly string[]): value is JsonObject => {
    if (!isRecord(value)) {
        return false;
    }
    return keys.every((key) => typeof value[key] === 'number');
};

const isPreviewIssue = (value: JsonValue): value is PreviewIssue => {
    if (!isRecord(value)) {
        return false;
    }
    return (
        typeof value.code === 'string' &&
        typeof value.message === 'string' &&
        typeof value.path === 'string' &&
        (value.severity === 'error' || value.severity === 'warning')
    );
};

const ASSET_CATEGORIES: readonly PreviewAssetCategory[] = [
    'character',
    'enemy',
    'item',
    'skill',
    'scene',
    'music',
    'sound',
];

const isPreviewAssetReference = (value: JsonValue): value is PreviewAssetReference =>
    isRecord(value) &&
    typeof value.reference === 'string' &&
    typeof value.category === 'string' &&
    ASSET_CATEGORIES.includes(value.category as PreviewAssetCategory);

const isPreviewPack = (value: JsonValue): value is PreviewPack => {
    if (!isRecord(value)) {
        return false;
    }
    return (
        typeof value.name === 'string' &&
        value.version === 1 &&
        isStringArray(value.dependencies)
    );
};

const isCatalogKindMap = (value: JsonValue): value is Readonly<Record<string, JsonObject>> => {
    if (!isRecord(value)) {
        return false;
    }
    return Object.values(value).every((entry) => isRecord(entry));
};

const isDialogueSpeaker = (value: JsonValue): boolean => {
    if (!isRecord(value) || typeof value.kind !== 'string') {
        return false;
    }
    switch (value.kind) {
        case 'player':
        case 'narrator':
            return true;
        case 'character':
            return typeof value.characterId === 'string';
        case 'npc':
            return typeof value.npcId === 'string';
        default:
            return false;
    }
};

const isDialogueEdge = (value: JsonValue): boolean => {
    if (!isRecord(value) || typeof value.kind !== 'string') {
        return false;
    }
    if (value.kind === 'end') {
        return true;
    }
    return value.kind === 'node' && typeof value.nodeId === 'string';
};

const isDialogueChoice = (value: JsonValue): boolean => {
    if (!isRecord(value)) {
        return false;
    }
    return (
        typeof value.id === 'string' &&
        typeof value.text === 'string' &&
        isDialogueEdge(value.next) &&
        (value.condition === undefined || isPreviewCondition(value.condition)) &&
        (value.commands === undefined || isPreviewContentCommandArray(value.commands))
    );
};

const isDialogueNode = (value: JsonValue): boolean => {
    if (!isRecord(value) || typeof value.id !== 'string' || !isDialogueSpeaker(value.speaker)) {
        return false;
    }
    if (typeof value.text !== 'string') {
        return false;
    }
    for (const legacyField of LEGACY_DIALOGUE_FIELDS) {
        if (legacyField in value) {
            return false;
        }
    }
    if (value.kind === 'line') {
        return isDialogueEdge(value.next);
    }
    if (value.kind === 'choice') {
        return Array.isArray(value.choices) && value.choices.length > 0 && value.choices.every(isDialogueChoice);
    }
    return false;
};

const isDialogueGraph = (value: JsonObject): boolean => {
    if (typeof value.startNodeId !== 'string' || !Array.isArray(value.nodes) || value.nodes.length === 0) {
        return false;
    }
    if ('author' in value || 'targetNodeId' in value) {
        return false;
    }
    return (
        value.nodes.every(isDialogueNode) &&
        (value.completionCommands === undefined ||
            isPreviewContentCommandArray(value.completionCommands))
    );
};

const isPreviewCondition = (value: JsonValue): boolean => {
    if (!isRecord(value) || typeof value.kind !== 'string') {
        return false;
    }
    switch (value.kind) {
        case 'always':
            return typeof value.value === 'boolean';
        case 'flag':
            return (
                typeof value.flagId === 'string' &&
                (value.operator === 'eq' || value.operator === 'neq') &&
                (value.value === null ||
                    typeof value.value === 'boolean' ||
                    typeof value.value === 'number' ||
                    typeof value.value === 'string')
            );
        case 'quest-status':
            return (
                typeof value.questId === 'string' &&
                (value.status === 'discovered' ||
                    value.status === 'active' ||
                    value.status === 'on-hold' ||
                    value.status === 'completed' ||
                    value.status === 'failed')
            );
        case 'quest-current-stage':
            return typeof value.questId === 'string' && typeof value.stageId === 'string';
        case 'quest-stage-status':
            return (
                typeof value.questId === 'string' &&
                typeof value.stageId === 'string' &&
                (value.status === 'active' ||
                    value.status === 'on-hold' ||
                    value.status === 'completed' ||
                    value.status === 'failed')
            );
        case 'quest-goal-complete':
            return (
                typeof value.questId === 'string' &&
                typeof value.stageId === 'string' &&
                typeof value.goalId === 'string'
            );
        case 'item-count':
            return (
                typeof value.itemId === 'string' &&
                (value.operator === 'eq' || value.operator === 'gte' || value.operator === 'lte') &&
                typeof value.quantity === 'number'
            );
        case 'main-character-class':
            return typeof value.characterClass === 'string';
        case 'roster-has-character':
        case 'active-party-has-character':
            return typeof value.characterId === 'string';
        case 'resolver':
            return (
                typeof value.name === 'string' &&
                (value.args === undefined || isRecord(value.args))
            );
        case 'all':
        case 'any':
            return Array.isArray(value.conditions) && value.conditions.every(isPreviewCondition);
        case 'not':
            return isPreviewCondition(value.condition);
        default:
            return false;
    }
};

const NPC_DIALOGUE_PRIORITY_KEYS = ['dialogueId', 'condition'] as const;
const NPC_DIALOGUE_FIXED_FALLBACK_KEYS = ['kind', 'dialogueId'] as const;
const NPC_DIALOGUE_RANDOM_FALLBACK_KEYS = ['kind', 'dialogueIds'] as const;
const NPC_DIALOGUE_SELECTION_KEYS = ['priority', 'fallback'] as const;

const hasOnlyKeys = (value: JsonObject, allowedKeys: readonly string[]): boolean =>
    Object.keys(value).every((key) => allowedKeys.includes(key));

const isNpcDialoguePriorityEntry = (value: JsonValue): boolean => {
    if (!isRecord(value) || !hasOnlyKeys(value, NPC_DIALOGUE_PRIORITY_KEYS)) {
        return false;
    }
    return (
        typeof value.dialogueId === 'string' &&
        value.dialogueId.length > 0 &&
        isPreviewCondition(value.condition)
    );
};

const isNpcDialogueFallback = (value: JsonValue): boolean => {
    if (!isRecord(value) || typeof value.kind !== 'string') {
        return false;
    }
    switch (value.kind) {
        case 'fixed':
            return (
                hasOnlyKeys(value, NPC_DIALOGUE_FIXED_FALLBACK_KEYS) &&
                typeof value.dialogueId === 'string' &&
                value.dialogueId.length > 0
            );
        case 'random':
            return (
                hasOnlyKeys(value, NPC_DIALOGUE_RANDOM_FALLBACK_KEYS) &&
                Array.isArray(value.dialogueIds) &&
                value.dialogueIds.length >= 2 &&
                value.dialogueIds.every(
                    (dialogueId) => typeof dialogueId === 'string' && dialogueId.length > 0,
                )
            );
        default:
            return false;
    }
};

const isNpcDialogueSelection = (value: JsonValue): boolean => {
    if (!isRecord(value) || !hasOnlyKeys(value, NPC_DIALOGUE_SELECTION_KEYS)) {
        return false;
    }
    return (
        Array.isArray(value.priority) &&
        value.priority.every(isNpcDialoguePriorityEntry) &&
        isNpcDialogueFallback(value.fallback)
    );
};

const isNpcDefinition = (value: JsonObject): boolean => {
    if (
        typeof value.id !== 'string' ||
        typeof value.label !== 'string' ||
        value.label.trim().length === 0 ||
        (value.title !== undefined && typeof value.title !== 'string')
    ) {
        return false;
    }
    if (Array.isArray(value.dialogues)) {
        return false;
    }
    return isNpcDialogueSelection(value.dialogues);
};

const isQuestGoal = (value: JsonValue): boolean => {
    if (!isRecord(value) || typeof value.id !== 'string' || typeof value.label !== 'string') {
        return false;
    }
    if (typeof value.target !== 'number' || value.target < 1) {
        return false;
    }
    switch (value.kind) {
        case 'item':
            return typeof value.itemId === 'string';
        case 'enemy':
            return typeof value.enemyId === 'string';
        case 'encounter':
            return typeof value.encounterId === 'string';
        default:
            return false;
    }
};

const isQuestStage = (value: JsonValue): boolean => {
    if (!isRecord(value)) {
        return false;
    }
    return (
        typeof value.id === 'string' &&
        typeof value.objective === 'string' &&
        typeof value.description === 'string' &&
        Array.isArray(value.goals) &&
        value.goals.every(isQuestGoal)
    );
};

const isQuestTransition = (value: JsonValue): boolean => {
    if (!isRecord(value) || typeof value.id !== 'string' || typeof value.kind !== 'string') {
        return false;
    }
    if (LEGACY_QUEST_FIELDS.includes(value.kind as (typeof LEGACY_QUEST_FIELDS)[number])) {
        return false;
    }
    if (
        (value.condition !== undefined && !isPreviewCondition(value.condition)) ||
        (value.commands !== undefined && !isPreviewContentCommandArray(value.commands))
    ) {
        return false;
    }
    switch (value.kind) {
        case 'start':
            return typeof value.toStageId === 'string';
        case 'advance':
            return typeof value.fromStageId === 'string' && typeof value.toStageId === 'string';
        case 'hold':
        case 'resume':
            return typeof value.stageId === 'string';
        case 'complete':
            return typeof value.fromStageId === 'string';
        case 'fail':
            return (
                (value.fromStatus === 'active' || value.fromStatus === 'on-hold') &&
                typeof value.stageId === 'string'
            );
        default:
            return false;
    }
};

const isQuestDefinition = (value: JsonObject): boolean => {
    if (
        typeof value.journalHint !== 'string' ||
        typeof value.initialStageId !== 'string' ||
        typeof value.label !== 'string' ||
        typeof value.main !== 'boolean'
    ) {
        return false;
    }
    if (!Array.isArray(value.stages) || value.stages.length === 0 || !value.stages.every(isQuestStage)) {
        return false;
    }
    if (Array.isArray(value.transitions)) {
        return value.transitions.length > 0 && value.transitions.every(isQuestTransition);
    }
    return false;
};

const CATALOG_ENTRY_RULES = [
    ['dialogue', isDialogueGraph, 'semantic dialogue graph (startNodeId, typed speakers, explicit edges)'],
    ['npc', isNpcDefinition, 'labeled NPC with priority conditions plus a fixed or random fallback'],
    ['quest', isQuestDefinition, 'quest definition (journalHint, initialStageId, transitions array)'],
] as const;

const describeCatalogError = (value: JsonValue): string | undefined => {
    if (!isRecord(value) || value.version !== 1) {
        return 'Catalog must be a version 1 object.';
    }
    if (!Array.isArray(value.encounterOverlay) || !value.encounterOverlay.every(isRecord)) {
        return 'Catalog encounterOverlay must be an array of objects.';
    }
    const invalidKind = CONTENT_KINDS.find((kind) => !isCatalogKindMap(value[kind]));
    if (invalidKind) {
        return `Catalog "${invalidKind}" must map IDs to objects.`;
    }
    for (const [kind, isValid, expected] of CATALOG_ENTRY_RULES) {
        const entries = Object.entries(value[kind] as Readonly<Record<string, JsonObject>>);
        const invalidId = entries.find(([, entry]) => !isValid(entry))?.[0];
        if (invalidId) {
            return `Catalog ${kind} "${invalidId}" must be a ${expected}.`;
        }
    }
    return undefined;
};

const isPreviewReport = (value: JsonValue): value is PreviewReport => {
    if (!isRecord(value) || value.version !== 1) {
        return false;
    }
    if (typeof value.sourceHash !== 'string' || !SOURCE_HASH_PATTERN.test(value.sourceHash)) {
        return false;
    }
    if (!isNumberRecord(value.counts, CONTENT_KINDS)) {
        return false;
    }
    if (!Array.isArray(value.issues) || !value.issues.every((issue) => isPreviewIssue(issue))) {
        return false;
    }
    if (
        !isRecord(value.assets) ||
        !Array.isArray(value.assets.references) ||
        !value.assets.references.every((reference) => isPreviewAssetReference(reference))
    ) {
        return false;
    }
    return true;
};

export const describePreviewBundleErrors = (value: unknown): readonly string[] => {
    if (!isRecord(value as JsonValue)) {
        return ['Bundle root must be an object.'];
    }
    const bundle = value as JsonObject;
    const errors: string[] = [];
    if (bundle.version !== PREVIEW_BUNDLE_VERSION) {
        errors.push(`Expected bundle version ${PREVIEW_BUNDLE_VERSION}, got ${String(bundle.version)}.`);
    }
    if (typeof bundle.sourceHash !== 'string' || !SOURCE_HASH_PATTERN.test(bundle.sourceHash)) {
        errors.push('Missing or invalid sourceHash.');
    }
    if (!Array.isArray(bundle.packs) || !bundle.packs.every((pack) => isPreviewPack(pack))) {
        errors.push('Invalid packs array.');
    }
    const catalogError = describeCatalogError(bundle.catalog);
    if (catalogError) {
        errors.push(catalogError);
    }
    if (!isPreviewReport(bundle.report)) {
        errors.push('Invalid report block.');
    } else if (bundle.sourceHash !== bundle.report.sourceHash) {
        errors.push('sourceHash does not match report.sourceHash.');
    }
    return errors;
};

export const isStalePreviewBundle = (value: unknown): boolean => {
    const candidate = value as JsonValue;
    return (
        isRecord(candidate) &&
        typeof candidate.version === 'number' &&
        candidate.version !== PREVIEW_BUNDLE_VERSION
    );
};
