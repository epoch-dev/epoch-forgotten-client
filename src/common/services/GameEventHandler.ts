import type { GameEventDto } from '../api/.generated';
import { useGameStore } from '../../views/game/GameStore';
import { GameView } from '../../views/game/types';
import { ScenesService } from '../../views/scenes/ScenesService';
import { SoundService } from './SoundService';
import { ToastService } from './ToastService';

const soundService = SoundService.getInstance();

function formatContentId(id: string): string {
    const slash = id.lastIndexOf('/');
    const segment = slash >= 0 ? id.slice(slash + 1) : id;
    return segment.replace(/-/g, ' ');
}

export class GameEventHandler {
    public static async present(events: readonly GameEventDto[]): Promise<void> {
        for (const event of events) {
            await this.presentOne(event);
        }
    }

    private static async presentOne(event: GameEventDto): Promise<void> {
        switch (event.kind) {
            case 'item-granted':
                ToastService.success({
                    message: `Received ${formatContentId(event.itemId)} (${event.quantity})`,
                });
                return;
            case 'item-consumed':
                ToastService.success({
                    message: `Used ${formatContentId(event.itemId)} (${event.quantity})`,
                });
                return;
            case 'character-recruited':
                ToastService.success({
                    message: `${formatContentId(event.characterId)} joined your party!`,
                });
                return;
            case 'affinity-changed':
                return;
            case 'encounter-started':
                useGameStore.setState((prev) => ({
                    ...prev,
                    view: GameView.Battle,
                    encounterName: event.encounterId,
                }));
                return;
            case 'dialogue-opened':
                useGameStore.setState((prev) => ({
                    ...prev,
                    view: GameView.Dialogue,
                    npcName: event.npcId,
                }));
                return;
            case 'gold-granted':
                ToastService.success({ message: `Obtained ${event.amount} gold!` });
                return;
            case 'experience-granted':
                ToastService.success({ message: `Obtained ${event.amount} experience!` });
                return;
            case 'teleported':
                await ScenesService.initialize();
                await useGameStore.getState().scene?.loadScene();
                return;
            case 'flag-changed':
                return;
            case 'quest-discovered':
                ToastService.success({
                    message: `Quest discovered: ${formatContentId(event.questId)}`,
                });
                return;
            case 'quest-started':
                soundService.newQuest();
                ToastService.success({
                    message: `Quest started: ${formatContentId(event.questId)}`,
                });
                return;
            case 'quest-advanced':
                ToastService.success({
                    message: `Quest advanced: ${formatContentId(event.questId)}`,
                });
                return;
            case 'quest-held':
                ToastService.success({
                    message: `Quest on hold: ${formatContentId(event.questId)}`,
                });
                return;
            case 'quest-resumed':
                ToastService.success({
                    message: `Quest resumed: ${formatContentId(event.questId)}`,
                });
                return;
            case 'quest-completed':
                ToastService.success({
                    message: `${formatContentId(event.questId)} completed!`,
                });
                return;
            case 'quest-failed':
                ToastService.error({
                    message: `${formatContentId(event.questId)} failed!`,
                });
                return;
            case 'quest-goal-progressed':
                return;
            default: {
                const exhaustive: never = event;
                throw new Error(`Unhandled game event: ${JSON.stringify(exhaustive)}`);
            }
        }
    }
}
