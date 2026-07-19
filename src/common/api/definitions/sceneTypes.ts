import { CharacterRace } from '../.generated';

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
    UpLeft = 'UpLeft',
    UpRight = 'Upright',
    DownLeft = 'DownLeft',
    DownRight = 'DownRight',
}

export type SceneMoveDto = {
    direction: SceneMoveDirection;
};

export type SceneMoveResultDto = {
    newPosition: ScenePoint;
    encounterData?: {
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
