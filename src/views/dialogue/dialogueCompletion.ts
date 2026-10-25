import { isAxiosError } from 'axios';
import {
    completeDialogue,
    type GameEventDto,
} from '../../common/api/.generated';
import type { DialogueGraph } from './dialogueGraph';
import { DialogueGraphWalker } from './dialogueGraph';

export type ActiveDialogueRun = Readonly<{
    walker: DialogueGraphWalker;
    completionId: string;
}>;

export type DialogueCompletionResult =
    | Readonly<{ status: 'completed'; events: readonly GameEventDto[] }>
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
        const result = await completeDialogue({
            npcId,
            dialogueId: submission.dialogueId,
            revision: submission.revision,
            completionId: submission.completionId,
            choicePath: [...submission.choicePath],
        });

        return { status: 'completed', events: result.events };
    } catch (error) {
        if (isAxiosError(error) && error.response?.status === 409) {
            return { status: 'stale' };
        }
        throw error;
    }
}
