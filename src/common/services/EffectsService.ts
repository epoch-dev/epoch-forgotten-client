import { useGameStore } from '../../views/game/GameStore';
import { GameView } from '../../views/game/types';
import { Effects, EffectsItemsInner, EffectsQuest, NpcDialogue } from '../api/.generated';
import { questsClient } from '../api/client';
import { SoundService } from './SoundService';
import { ToastService } from './ToastService';

const STARTING_STAGE = 'stage1';
const soundService = SoundService.getInstance();

export class EffectsService {
    public static async showEffects(allEffects: Effects[]) {
        for (const effects of allEffects) {
            for (const questEffect of effects.quests || []) {
                this.handleQuestEffect(questEffect);
            }
            for (const item of effects.items || []) {
                this.handleItemEffect(item);
            }
            if (effects.encounter) {
                this.handleEncounterEffect(effects.encounter);
            }
            if (effects.dialogue) {
                this.handleDialogueEffect(effects.dialogue);
            }
        }
    }

    private static async handleQuestEffect(questEffect: EffectsQuest) {
        const quest = (await questsClient.getQuest(questEffect.name, questEffect.stageId)).data;
        if (questEffect.stageId === STARTING_STAGE) {
            soundService.newQuest();
            ToastService.success({ message: `Quest "${quest.label}" started!` });
        } else if (quest.isLastStage) {
            ToastService.success({ message: `"${quest.label}" completed!` });
        } else if (questEffect.state === 'Failed') {
            ToastService.error({ message: `Quest "${quest.label}" failed!` });
        } else if (questEffect.state === 'In-progress' && quest.stages[quest.stages.length - 1].objective) {
            ToastService.success({
                message: quest.stages[quest.stages.length - 1].objective ?? '',
            });
        }
    }

    private static handleItemEffect(item: EffectsItemsInner) {
        ToastService.success({ message: `Received ${item.name} (${item.quantity})` });
    }

    private static handleEncounterEffect(encounterName: string) {
        useGameStore.setState((prev) => ({
            ...prev,
            view: GameView.Battle,
            encounterName,
        }));
    }

    private static handleDialogueEffect(dialogue: NpcDialogue) {
        useGameStore.setState((prev) => ({
            ...prev,
            view: GameView.Dialogue,
            dialogue,
        }));
    }
}
