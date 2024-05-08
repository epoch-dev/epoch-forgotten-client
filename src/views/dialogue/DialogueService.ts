import { DialogueNode, Effects, NpcDialogueDto, NpcDialogueUpdatesDto } from '../../common/api/.generated';
import { NpcsClient } from '../../common/api/client';
import { SoundService } from '../../common/services/SoundService';
import { ToastService } from '../../common/services/ToastService';

export class DialogueService {
    private static decisions: NpcDialogueUpdatesDto;
    private static currentNodeIndex = 0;
    private static dialogue: DialogueNode[] = [];
    private static onNodeChange: (node: DialogueNode) => void;
    private static onComplete: () => void;
    private static effectsAll: Effects[] = [];

    public static setup(
        name: string,
        npcDialogue: NpcDialogueDto,
        { onNodeChange, onComplete }: { onNodeChange: (node: DialogueNode) => void; onComplete: () => void },
    ) {
        this.currentNodeIndex = 0;
        this.dialogue = npcDialogue.nodes;
        npcDialogue.effects && this.effectsAll.push(npcDialogue.effects);
        this.decisions = { name, nodes: {} };
        this.onNodeChange = onNodeChange;
        this.onComplete = () => {
            onComplete();
            this.sendDecisions();
        };
    }

    public static getCurrentNode() {
        return this.dialogue[this.currentNodeIndex];
    }

    public static async start() {
        await this.handleDialogue();
    }

    private static async handleDialogue() {
        const currentNode = this.dialogue[this.currentNodeIndex];
        this.onNodeChange(currentNode);
    }

    public static async handleUserInput(optionIndex: number) {
        const currentNode = this.dialogue[this.currentNodeIndex];
        const chosenOption = currentNode.options![optionIndex];
        if (chosenOption.flagValue || chosenOption.effects) {
            chosenOption.effects && this.effectsAll.push(chosenOption.effects);
            this.decisions.nodes[currentNode.id] = chosenOption.id;
        }

        this.dialogue = this.filterNodes(this.dialogue, chosenOption.targetNodeId);

        const newCurrentNodeIndex = this.getNextNodeIndex(this.dialogue, chosenOption.targetNodeId);
        if (newCurrentNodeIndex >= 0) {
            this.currentNodeIndex = newCurrentNodeIndex;
            this.handleDialogue();
        } else {
            this.onComplete();
        }
    }

    public static async proceedToNextNode() {
        this.currentNodeIndex++;
        if (this.currentNodeIndex < this.dialogue.length) {
            this.onNodeChange(this.dialogue[this.currentNodeIndex]);
        } else {
            this.onComplete();
        }
    }

    private static filterNodes(nodes: DialogueNode[], chosenNodeId: string) {
        const nodeIdsToRemove = new Set();
        nodes.forEach((node) => {
            if (node.options) {
                node.options.forEach((option) => {
                    if (option.targetNodeId !== chosenNodeId) {
                        nodeIdsToRemove.add(option.targetNodeId);
                    }
                });
            }
        });
        return nodes.filter((node) => !nodeIdsToRemove.has(node.id));
    }

    private static getNextNodeIndex(nodes: DialogueNode[], chosenNodeId: string) {
        return nodes.findIndex((node) => node.id === chosenNodeId);
    }

    public static async sendDecisions() {
        // todo: for now sending from here
        if (Object.keys(this.decisions.nodes).length > 0) {
            await NpcsClient.updateFromDialogue(this.decisions);
            for (const effects of this.effectsAll) {
                if (effects.quest) {
                    SoundService.getInstance().newQuest();
                    ToastService.success({ message: 'Started new quest!' });
                }
                if (effects.items) {
                    ToastService.success({ message: 'Received new items!' });
                }
            }
        }
    }
}
