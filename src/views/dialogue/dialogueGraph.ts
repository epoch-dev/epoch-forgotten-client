export type DialogueGraphEdge =
    | Readonly<{ kind: 'node'; nodeId: string }>
    | Readonly<{ kind: 'end' }>;

export type DialogueGraphSpeaker =
    | Readonly<{ kind: 'player'; label: string; imageUri?: string }>
    | Readonly<{ kind: 'narrator' }>
    | Readonly<{
          kind: 'character';
          characterId: string;
          label: string;
          imageUri?: string;
      }>
    | Readonly<{
          kind: 'npc';
          npcId: string;
          label: string;
          imageUri?: string;
      }>;

export type DialogueGraphNode =
    | Readonly<{
          kind: 'line';
          id: string;
          speaker: DialogueGraphSpeaker;
          text: string;
          imageUri?: string;
          imageAlt?: string;
          next: DialogueGraphEdge;
      }>
    | Readonly<{
          kind: 'choice';
          id: string;
          speaker: DialogueGraphSpeaker;
          text: string;
          choices: readonly Readonly<{
              id: string;
              text: string;
              next: DialogueGraphEdge;
          }>[];
      }>;

export type DialogueGraph = Readonly<{
    id: string;
    revision: string;
    startNodeId: string;
    nodes: readonly DialogueGraphNode[];
}>;

export type DialogueCompletionSubmission = Readonly<{
    dialogueId: string;
    revision: string;
    completionId: string;
    choicePath: readonly string[];
}>;

export class DialogueGraphWalker {
    private readonly nodes: ReadonlyMap<string, DialogueGraphNode>;
    private readonly choicePath: string[] = [];
    private currentNodeId: string | undefined;

    public constructor(private readonly graph: DialogueGraph) {
        this.nodes = new Map(graph.nodes.map((node) => [node.id, node]));
        if (!this.nodes.has(graph.startNodeId)) {
            throw new Error(`Dialogue start node "${graph.startNodeId}" is missing`);
        }
        this.currentNodeId = graph.startNodeId;
    }

    public getCurrentNode(): DialogueGraphNode | undefined {
        return this.currentNodeId === undefined ? undefined : this.requireNode(this.currentNodeId);
    }

    public advance(): DialogueGraphNode | undefined {
        const node = this.requireCurrentNode();
        if (node.kind !== 'line') {
            throw new Error(`Dialogue node "${node.id}" requires a choice`);
        }
        return this.follow(node.next);
    }

    public choose(optionId: string): DialogueGraphNode | undefined {
        const node = this.requireCurrentNode();
        if (node.kind !== 'choice') {
            throw new Error(`Dialogue node "${node.id}" does not accept a choice`);
        }
        const choice = node.choices.find((candidate) => candidate.id === optionId);
        if (!choice) {
            throw new Error(`Dialogue choice "${optionId}" is unavailable at node "${node.id}"`);
        }
        this.choicePath.push(choice.id);
        return this.follow(choice.next);
    }

    public createCompletionSubmission(completionId: string): DialogueCompletionSubmission {
        if (this.currentNodeId !== undefined) {
            throw new Error('Dialogue must reach an explicit end before completion');
        }
        if (completionId.trim().length === 0) {
            throw new Error('Dialogue completion ID is required');
        }
        return {
            dialogueId: this.graph.id,
            revision: this.graph.revision,
            completionId,
            choicePath: [...this.choicePath],
        };
    }

    private follow(edge: DialogueGraphEdge): DialogueGraphNode | undefined {
        switch (edge.kind) {
            case 'node':
                this.currentNodeId = edge.nodeId;
                return this.requireNode(edge.nodeId);
            case 'end':
                this.currentNodeId = undefined;
                return undefined;
            default: {
                const exhaustive: never = edge;
                throw new Error(`Unknown dialogue edge: ${JSON.stringify(exhaustive)}`);
            }
        }
    }

    private requireCurrentNode(): DialogueGraphNode {
        if (this.currentNodeId === undefined) {
            throw new Error('Dialogue has already completed');
        }
        return this.requireNode(this.currentNodeId);
    }

    private requireNode(nodeId: string): DialogueGraphNode {
        const node = this.nodes.get(nodeId);
        if (!node) {
            throw new Error(`Dialogue node "${nodeId}" is missing`);
        }
        return node;
    }
}
