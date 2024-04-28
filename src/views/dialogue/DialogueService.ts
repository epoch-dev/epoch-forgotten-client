import { DialogueNode, DialogueOption } from '../../common/api/.generated';
import { SoundService } from '../../common/services/SoundService';

export class DialogueService {
    private readonly decisions: DialogueOption['id'][];
    private currentNodeIndex = 0;
    private dialogue;
    private onNodeChange;
    private onComplete;

    constructor(
        dialogue: DialogueNode[],
        { onNodeChange, onComplete }: { onNodeChange: (node: DialogueNode) => void; onComplete: () => void },
    ) {
        this.dialogue = dialogue;
        this.decisions = [];
        this.onNodeChange = onNodeChange;
        this.onComplete = () => {
            onComplete();
            this.sendDecisions();
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
        this.decisions.push(chosenOption.id);

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

    public async sendDecisions() {
        // todo: for now sending from here
        if (this.decisions.length > 0) {
            SoundService.getInstance().newQuest();
            console.log(`Sending decisions: ${this.decisions}`);
        }
    }
}
