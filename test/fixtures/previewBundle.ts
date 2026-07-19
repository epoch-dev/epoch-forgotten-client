import type { PreviewBundle } from '../../src/content/types';

const sourceHash = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

export const previewBundleFixture: PreviewBundle = {
    version: 3,
    sourceHash,
    packs: [{ name: 'core', version: 1, dependencies: [] }],
    catalog: {
        version: 1,
        character: {
            'core:character/test': {
                id: 'core:character/test',
                label: 'Test',
                imageUri: 'story/main-1.png',
                class: 'Mercenary',
                race: 'Human',
                size: 100,
                skillTree: [],
                startingSkills: [],
            },
        },
        class: {
            'core:class/mercenary': {
                id: 'core:class/mercenary',
                class: 'Mercenary',
                skillTree: ['core:skill/merc-sword-slash'],
                startingSkills: ['core:skill/merc-sword-slash'],
            },
        },
        dialogue: {
            'core:dialogue/branch': {
                id: 'core:dialogue/branch',
                startNodeId: 'opening',
                nodes: [
                    {
                        kind: 'line',
                        id: 'opening',
                        speaker: { kind: 'npc', npcId: 'core:npc/innkeeper' },
                        text: 'Hello.',
                        next: { kind: 'node', nodeId: 'choose-path' },
                    },
                    {
                        kind: 'choice',
                        id: 'choose-path',
                        speaker: { kind: 'player' },
                        text: 'Which way?',
                        choices: [
                            {
                                id: 'left',
                                text: 'Left',
                                next: { kind: 'node', nodeId: 'left-path' },
                            },
                            {
                                id: 'right',
                                text: 'Right',
                                next: { kind: 'node', nodeId: 'right-path' },
                            },
                        ],
                    },
                    {
                        kind: 'line',
                        id: 'left-path',
                        speaker: { kind: 'npc', npcId: 'core:npc/innkeeper' },
                        text: 'Left path.',
                        next: { kind: 'node', nodeId: 'rejoin' },
                    },
                    {
                        kind: 'line',
                        id: 'right-path',
                        speaker: { kind: 'npc', npcId: 'core:npc/innkeeper' },
                        text: 'Right path.',
                        next: { kind: 'node', nodeId: 'rejoin' },
                    },
                    {
                        kind: 'line',
                        id: 'rejoin',
                        speaker: { kind: 'narrator' },
                        text: 'Paths meet.',
                        next: { kind: 'end' },
                    },
                    {
                        kind: 'line',
                        id: 'orphan',
                        speaker: { kind: 'narrator' },
                        text: 'Unreachable.',
                        next: { kind: 'end' },
                    },
                ],
            },
        },
        encounter: {},
        encounterOverlay: [
            {
                encounterId: 'core:encounter/test',
                sceneId: 'core:scene/test',
                position: { x: 10, y: 20 },
                displayCondition: { kind: 'always', value: true },
            },
        ],
        enemy: {},
        flag: {},
        item: {
            'core:item/potion': {
                id: 'core:item/potion',
                label: 'Potion',
                imageUri: 'items/potion.png',
                rarity: 'Common',
                type: 'Consumable',
                price: 10,
            },
        },
        npc: {
            'core:npc/innkeeper': {
                id: 'core:npc/innkeeper',
                label: 'Innkeeper',
                title: 'Inn Keeper',
                dialogues: {
                    priority: [
                        {
                            dialogueId: 'core:dialogue/branch',
                            condition: { kind: 'always', value: true },
                        },
                    ],
                    fallback: {
                        kind: 'fixed',
                        dialogueId: 'core:dialogue/branch',
                    },
                },
            },
        },
        quest: {
            'core:quest/tutorial': {
                id: 'core:quest/tutorial',
                label: 'Tutorial',
                journalHint: 'Talk to the innkeeper.',
                main: false,
                initialStageId: 'speak-with-innkeeper',
                stages: [
                    {
                        id: 'speak-with-innkeeper',
                        objective: 'Speak with the innkeeper.',
                        description: 'Start the tutorial.',
                        goals: [],
                    },
                    {
                        id: 'collect-potion',
                        objective: 'Collect a potion.',
                        description: 'Find one potion.',
                        goals: [
                            {
                                kind: 'item',
                                id: 'collect-potion-goal',
                                itemId: 'core:item/potion',
                                label: 'Potion',
                                target: 1,
                            },
                        ],
                    },
                ],
                transitions: [
                    {
                        id: 'begin-tutorial',
                        kind: 'start',
                        toStageId: 'speak-with-innkeeper',
                    },
                    {
                        id: 'advance-to-collection',
                        kind: 'advance',
                        fromStageId: 'speak-with-innkeeper',
                        toStageId: 'collect-potion',
                        commands: [{ kind: 'grant-gold', amount: 5 }],
                    },
                    {
                        id: 'finish-tutorial',
                        kind: 'complete',
                        fromStageId: 'collect-potion',
                        commands: [{ kind: 'grant-experience', amount: 25 }],
                    },
                ],
            },
        },
        scene: {
            'core:scene/test': {
                id: 'core:scene/test',
                columns: 2,
                rows: 2,
                tileSize: 10,
                tiles: [
                    { type: 'Route', position: { x: 0, y: 0 } },
                    { type: 'Npc', position: { x: 10, y: 0 }, npcId: 'core:npc/innkeeper' },
                ],
                imageUri: 'starting-village.png',
                musicUri: 'snowy-dream.ogg',
                battleMusicUri: 'base-battle-1.ogg',
                battleImageUri: 'snowy-battle.png',
                enemies: [],
                enemyGroupSize: [1],
                enemyEncounterChance: 0,
                respawn: { sceneId: 'core:scene/test', position: { x: 0, y: 0 } },
            },
        },
        skill: {
            'core:skill/merc-sword-slash': {
                id: 'core:skill/merc-sword-slash',
                label: 'Slash',
                imageUri: 'skills/sword-slash.png',
                manaCost: 0,
            },
        },
    },
    report: {
        version: 1,
        sourceHash,
        counts: {
            character: 1,
            class: 1,
            dialogue: 1,
            encounter: 0,
            enemy: 0,
            flag: 0,
            item: 1,
            npc: 1,
            quest: 1,
            scene: 1,
            skill: 1,
        },
        issues: [
            {
                code: 'balance-budget',
                message: 'Enemy level too high',
                path: 'catalog.enemy.boss',
                severity: 'warning',
            },
        ],
        assets: {
            references: [
                { category: 'character', reference: 'story/main-1.png' },
                { category: 'item', reference: 'items/potion.png' },
                { category: 'scene', reference: 'starting-village.png' },
            ],
        },
    },
};
