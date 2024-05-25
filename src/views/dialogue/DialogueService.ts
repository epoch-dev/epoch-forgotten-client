import { DialogueNode, Effects, NpcDialogueDto, NpcDialogueUpdatesDto } from '../../common/api/.generated';
import { NpcsClient, questsClient } from '../../common/api/client';
import { SoundService } from '../../common/services/SoundService';
import { ToastService } from '../../common/services/ToastService';

export class DialogueService {
    private readonly decisions: NpcDialogueUpdatesDto;
    private currentNodeIndex = 0;
    private dialogue;
    private onNodeChange;
    private onComplete;
    private effectsAll: Effects[] = [];

    constructor(
        name: string,
        npcDialogue: NpcDialogueDto,
        { onNodeChange, onComplete }: { onNodeChange: (node: DialogueNode) => void; onComplete: () => void },
    ) {
        this.dialogue = npcDialogue.nodes;
        npcDialogue.effects && this.effectsAll.push(npcDialogue.effects);
        this.decisions = { name, nodes: {} };
        this.onNodeChange = onNodeChange;
        this.onComplete = () => {
            onComplete();
            this.sendDialogueUpdates();
            this.showEffects();
        };
    }

    public async start() {
        await this.handleDialogue();
    }

    private async handleDialogue() {
        const currentNode = this.dialogue[this.currentNodeIndex];
        this.onNodeChange(currentNode);
    }

    public async handleUserInput(optionIndex: number) {
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

    public async proceedToNextNode() {
        this.currentNodeIndex++;
        if (this.currentNodeIndex < this.dialogue.length) {
            this.onNodeChange(this.dialogue[this.currentNodeIndex]);
        } else {
            this.onComplete();
        }
    }

    private filterNodes(nodes: DialogueNode[], chosenNodeId: string) {
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

    private getNextNodeIndex(nodes: DialogueNode[], chosenNodeId: string) {
        return nodes.findIndex((node) => node.id === chosenNodeId);
    }

    public async sendDialogueUpdates() { // todo: for now sending from here
        if (this.shouldUpdateService()) {
            await NpcsClient.updateFromDialogue(this.decisions);
        }
    }

    private shouldUpdateService = () => Object.keys(this.decisions.nodes).length > 0 || Object.keys(this.effectsAll).length > 0;

    private async showEffects() {
        for (const effects of this.effectsAll) {
            if (effects.quest) {
                SoundService.getInstance().newQuest();
                const quest = (await questsClient.getQuest(effects.quest.name, effects.quest.stageId)).data;
                ToastService.success({ message: 'Started a new quest! ' + `"${quest.label}"` });
            }
            if (effects.items) {
                ToastService.success({ message: 'Received new items!' });
            }
        }
    }
}
