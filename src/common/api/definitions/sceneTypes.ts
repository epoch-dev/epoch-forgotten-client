import { CharacterRace, EffectsDialogue } from '../.generated';

export type ScenePosition = {
    sceneName: string;
    position: ScenePoint;
};

export type ScenePoint = {
    x: number;
    y: number;
};

export enum SceneTileType {
    Route = 'Route',
    SafeRoute = 'SafeRoute',
    Collision = 'Collision',
    Encounter = 'Encounter',
    Passage = 'Passage',
    Quest = 'Quest',
    Npc = 'Npc',
}

export enum SceneMoveDirection {
    Up = 'Up',
    Left = 'Left',
    Right = 'Right',
    Down = 'Down',
}

export type SceneDataDto = {
    name: string;
    tiles: SceneTileDto[];
    userPosition: ScenePoint;
    musicUri: string;
    imageUri: string;
    battleMusicUri: string;
    battleImageUri: string;
    // TODO - replace type literal with PlotPoint after TSOA detach
    plotPoint?: EffectsDialogue | undefined;
};

export type SceneTileDto = {
    position: ScenePoint;
    type: SceneTileType;
};

export type SceneMoveDto = {
    direction: SceneMoveDirection;
};

export type SceneMoveResultDto = {
    newPosition: ScenePoint;
    encounterData?: {
        // TODO - replace type literal with EnemyBattleInfo after TSOA detach
        enemies: {
            name: string;
            label: string;
            race: CharacterRace;
            title: string | undefined;
            imageUri: string;
            level: number;
        }[];
        canEscape: boolean;
    };
    newSceneData?: {
        sceneName: string;
    };
    npcData?: {
        npcName: string;
    };
};

export type SceneSize = {
    width: number;
    height: number;
};
