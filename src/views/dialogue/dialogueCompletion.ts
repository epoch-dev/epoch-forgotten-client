import { isAxiosError } from 'axios';
import { npcsClient } from '../../common/api/client';
import { GameEventHandler } from '../../common/services/GameEventHandler';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import type { DialogueGraph } from './dialogueGraph';
import { DialogueGraphWalker } from './dialogueGraph';

export type ActiveDialogueRun = Readonly<{
    walker: DialogueGraphWalker;
    completionId: string;
}>;

export type DialogueCompletionResult =
    | Readonly<{ status: 'completed' }>
    | Readonly<{ status: 'stale' }>;

export function createDialogueRun(graph: DialogueGraph): ActiveDialogueRun {
    return {
        walker: new DialogueGraphWalker(graph),
        completionId: crypto.randomUUID(),
    };
}

export async function completeDialogueRun(
    npcId: string,
    run: ActiveDialogueRun,
): Promise<DialogueCompletionResult> {
    const submission = run.walker.createCompletionSubmission(run.completionId);
    try {
        const result = await npcsClient.completeDialogue({
            npcId,
            dialogueId: submission.dialogueId,
            revision: submission.revision,
            completionId: submission.completionId,
            choicePath: [...submission.choicePath],
        });

        useGameStore.getState().setView(GameView.World);
        await GameEventHandler.present(result.data.events);
        return { status: 'completed' };
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
            return { status: 'stale' };
        }
        throw error;
    }
}
