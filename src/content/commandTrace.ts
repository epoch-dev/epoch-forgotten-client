import type { JsonObject, JsonPrimitive } from './types';

export type PreviewContentCommand =
    | Readonly<{ kind: 'grant-item'; itemId: string; quantity: number }>
    | Readonly<{
          kind: 'recruit-character';
          characterId: string;
          level: number;
          affinity?: number;
      }>
    | Readonly<{ kind: 'change-affinity'; characterId: string; amount: number }>
    | Readonly<{ kind: 'start-encounter'; encounterId: string }>
    | Readonly<{ kind: 'open-dialogue'; npcId: string }>
    | Readonly<{ kind: 'grant-gold'; amount: number }>
    | Readonly<{ kind: 'grant-experience'; amount: number }>
    | Readonly<{
          kind: 'teleport';
          sceneId: string;
          position: Readonly<{ x: number; y: number }>;
      }>
    | Readonly<{ kind: 'set-flag'; flagId: string; value: JsonPrimitive }>
    | Readonly<{ kind: 'discover-quest'; questId: string }>
    | Readonly<{
          kind: 'apply-quest-transition';
          questId: string;
          transitionId: string;
      }>;

export type CommandEventTrace = Readonly<{
    commandSummary: string;
    expectedEvents: readonly string[];
    note: string;
}>;

const isRecord = (value: unknown): value is JsonObject =>
    value !== null && typeof value === 'object' && !Array.isArray(value);

const isJsonPrimitive = (value: unknown): value is JsonPrimitive =>
    value === null ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string';

export const isPreviewContentCommand = (value: unknown): value is PreviewContentCommand => {
    if (!isRecord(value) || typeof value.kind !== 'string') {
        return false;
    }
    switch (value.kind) {
        case 'grant-item':
            return typeof value.itemId === 'string' && typeof value.quantity === 'number';
        case 'recruit-character':
            return (
                typeof value.characterId === 'string' &&
                typeof value.level === 'number' &&
                (value.affinity === undefined || typeof value.affinity === 'number')
            );
        case 'change-affinity':
            return typeof value.characterId === 'string' && typeof value.amount === 'number';
        case 'start-encounter':
            return typeof value.encounterId === 'string';
        case 'open-dialogue':
            return typeof value.npcId === 'string';
        case 'grant-gold':
        case 'grant-experience':
            return typeof value.amount === 'number';
        case 'teleport':
            return (
                typeof value.sceneId === 'string' &&
                isRecord(value.position) &&
                typeof value.position.x === 'number' &&
                typeof value.position.y === 'number'
            );
        case 'set-flag':
            return typeof value.flagId === 'string' && isJsonPrimitive(value.value);
        case 'discover-quest':
            return typeof value.questId === 'string';
        case 'apply-quest-transition':
            return typeof value.questId === 'string' && typeof value.transitionId === 'string';
        default:
            return false;
    }
};

export const isPreviewContentCommandArray = (
    value: unknown,
): value is readonly PreviewContentCommand[] =>
    Array.isArray(value) && value.every(isPreviewContentCommand);

export const traceCommand = (command: PreviewContentCommand): CommandEventTrace => {
    switch (command.kind) {
        case 'grant-item':
            return {
                commandSummary: `grant-item ${command.itemId} x${command.quantity}`,
                expectedEvents: [`item-granted (${command.itemId})`],
                note: 'Preview metadata only. Runtime may emit extra inventory events.',
            };
        case 'recruit-character':
            return {
                commandSummary: `recruit-character ${command.characterId} lv${command.level}`,
                expectedEvents: [`character-recruited (${command.characterId})`],
                note: 'Preview metadata only.',
            };
        case 'change-affinity':
            return {
                commandSummary: `change-affinity ${command.characterId} ${command.amount}`,
                expectedEvents: [`affinity-changed (${command.characterId})`],
                note: 'Preview metadata only.',
            };
        case 'start-encounter':
            return {
                commandSummary: `start-encounter ${command.encounterId}`,
                expectedEvents: [`encounter-started (${command.encounterId})`],
                note: 'Preview metadata only.',
            };
        case 'open-dialogue':
            return {
                commandSummary: `open-dialogue ${command.npcId}`,
                expectedEvents: [`dialogue-opened (${command.npcId}, selected dialogue)`],
                note: 'Preview metadata only. Runtime resolves the NPC dialogue variant.',
            };
        case 'grant-gold':
            return {
                commandSummary: `grant-gold ${command.amount}`,
                expectedEvents: [`gold-granted (${command.amount})`],
                note: 'Preview metadata only.',
            };
        case 'grant-experience':
            return {
                commandSummary: `grant-experience ${command.amount}`,
                expectedEvents: [`experience-granted (${command.amount})`],
                note: 'Preview metadata only.',
            };
        case 'teleport':
            return {
                commandSummary: `teleport ${command.sceneId}`,
                expectedEvents: [`teleported (${command.sceneId})`],
                note: 'Preview metadata only.',
            };
        case 'set-flag':
            return {
                commandSummary: `set-flag ${command.flagId}`,
                expectedEvents: [`flag-changed (${command.flagId})`],
                note: 'Preview metadata only.',
            };
        case 'discover-quest':
            return {
                commandSummary: `discover-quest ${command.questId}`,
                expectedEvents: [`quest-discovered (${command.questId})`],
                note: 'Preview metadata only.',
            };
        case 'apply-quest-transition': {
            return {
                commandSummary: `apply-quest-transition ${command.questId}#${command.transitionId}`,
                expectedEvents: [
                    `quest-started | quest-advanced | quest-held | quest-resumed | quest-completed | quest-failed (${command.questId}#${command.transitionId})`,
                ],
                note: 'Preview metadata only. Event kind depends on transition definition.',
            };
        }
        default: {
            const unhandled: never = command;
            return unhandled;
        }
    }
};

export const traceCommands = (
    commands: readonly PreviewContentCommand[],
): readonly CommandEventTrace[] =>
    commands.map((command) => traceCommand(command));
