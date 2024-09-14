import { useGameStore } from '../../views/game/GameStore';
import { GameView } from '../../views/game/types';
import { Effects } from '../api/.generated';
import { questsClient } from '../api/client';
import { SoundService } from './SoundService';
import { ToastService } from './ToastService';

type Single<T extends any[]> = T[number];

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
            if (effects.character) {
                this.handleCharacterEffect(effects.character);
            }
            if (effects.gold) {
                this.handleGoldEffect(effects.gold);
            }
            if (effects.exp) {
                this.handleExpEffect(effects.exp);
            }
        }
    }

    private static async handleQuestEffect(quest: Single<Required<Effects>['quests']>) {
        const questData = (await questsClient.getQuest(quest.name, quest.stageId)).data;
        if (quest.stageId === STARTING_STAGE) {
            soundService.newQuest();
            ToastService.success({ message: `Quest "${questData.label}" started!` });
        } else if (questData.isLastStage) {
            ToastService.success({ message: `"${questData.label}" completed!` });
        } else if (quest.state === 'Failed') {
            ToastService.error({ message: `Quest "${questData.label}" failed!` });
        } else if (quest.state === 'In-progress' && questData.stages[questData.stages.length - 1].objective) {
            ToastService.success({
                message: questData.stages[questData.stages.length - 1].objective,
            });
        }
    }

    private static handleItemEffect(item: Single<Required<Effects>['items']>) {
        ToastService.success({ message: `Received ${item.name} (${item.quantity})` });
    }

    private static handleEncounterEffect(encounter: Required<Effects>['encounter']) {
        useGameStore.setState((prev) => ({
            ...prev,
            view: GameView.Battle,
            encounterName: encounter,
        }));
    }

    private static handleDialogueEffect(dialogue: Required<Effects>['dialogue']) {
        useGameStore.setState((prev) => ({
            ...prev,
            view: GameView.Dialogue,
            dialogue: dialogue.dialogue,
            npcName: dialogue.npcName,
        }));
    }

    private static handleCharacterEffect(character: Required<Effects>['character']) {
        ToastService.success({ message: `${character.name} joined you party!` });
    }

    private static handleGoldEffect(gold: Required<Effects>['gold']) {
        ToastService.success({ message: `Obtained ${gold} gold!` });
    }

    private static handleExpEffect(exp: Required<Effects>['exp']) {
        ToastService.success({ message: `Obtained ${exp} experience!` });
    }
}
