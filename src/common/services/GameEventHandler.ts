import type { GameEventDto } from '../api/.generated';
import { useGameStore } from '../../views/game/GameStore';
import { GameView } from '../../views/game/types';
import { ScenesService } from '../../views/scenes/ScenesService';
import { SoundService } from './SoundService';
import { ToastService } from './ToastService';

const soundService = SoundService.getInstance();

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
                    message: `Received ${event.label} (${event.quantity})`,
                });
                return;
            case 'item-consumed':
                ToastService.success({
                    message: `Used ${event.label} (${event.quantity})`,
                });
                return;
            case 'character-recruited':
                ToastService.success({
                    message: `${event.label} joined your party!`,
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
                    message: `Quest discovered: ${event.label}`,
                });
                return;
            case 'quest-started':
                soundService.newQuest();
                ToastService.success({
                    message: `Quest started: ${event.label}`,
                });
                return;
            case 'quest-advanced':
                ToastService.success({
                    message: `Quest advanced: ${event.label}`,
                });
                return;
            case 'quest-held':
                ToastService.success({
                    message: `Quest on hold: ${event.label}`,
                });
                return;
            case 'quest-resumed':
                ToastService.success({
                    message: `Quest resumed: ${event.label}`,
                });
                return;
            case 'quest-completed':
                ToastService.success({
                    message: `${event.label} completed!`,
                });
                return;
            case 'quest-failed':
                ToastService.error({
                    message: `${event.label} failed!`,
                });
                return;
            case 'quest-goal-progressed':
                return;
            default: {
                const unhandled: never = event;
                console.warn('Unhandled game event', unhandled);
                return;
            }
        }
    }
}
