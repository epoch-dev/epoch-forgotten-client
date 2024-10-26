import { useEffect } from 'react';
import { SceneRenderer } from './SceneRenderer';
import { ScenesService } from './ScenesService';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { io } from 'socket.io-client';
import { StorageService } from '../../common/services/StorageService';
import { ToastService } from '../../common/services/ToastService';
import { appConfig } from '../../common/config';
import { SceneMoveDirection, SceneMoveResultDto } from '../../common/api/sceneTypes';

let wsClient = io(appConfig.apiUrl);

const isSceneMoveResult = (data: unknown): data is SceneMoveResultDto => {
    try {
        const obj = JSON.parse(data as string);
        return obj !== null && typeof obj === 'object' && 'newPosition' in obj;
    } catch {
        // invalid JSON
        return false;
    }
};

export const ScenesComponent = () => {
    const { view, setScene, setView, setEncounter, setNpcName: setNpc } = useGameStore();

    useEffect(() => {
        void ScenesService.initialize();
        const scene = new SceneRenderer({
            onMove,
            onEncounter: (encounter) => {
                if (encounter) {
                    setView(GameView.Battle);
                    setEncounter(encounter);
                }
            },
            onNpc: (npc) => {
                if (npc) {
                    setView(GameView.Dialogue);
                    setNpc(npc.npcName);
                }
            },
        });
        const game = new Phaser.Game({
            width: 1450,
            height: 750,
            scene: scene,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                },
            },
            parent: 'sceneWrapper',
        });
        setScene(scene);
        const authToken = StorageService.get('user')?.accessToken;
        wsClient = io(appConfig.apiUrl, { extraHeaders: { authorization: `Bearer ${authToken}` } });
        wsClient.on('message', async (wsData: string) => {
            if (!isSceneMoveResult(wsData)) {
                ToastService.error({ message: wsData });
                return;
            }
            const moveResult: SceneMoveResultDto = JSON.parse(wsData);
            ScenesService.userPosition = moveResult.newPosition;
            if (moveResult.newSceneData) {
                await ScenesService.initialize();
            }
            scene.moveUser({
                newPosition: await ScenesService.getUserPosition(),
                sceneChanged: moveResult.newSceneData !== undefined,
                encounter: moveResult.encounterData,
                npc: moveResult.npcData,
            });
        });
        return () => {
            game.destroy(true);
            wsClient.disconnect();
        };
    }, []);

    const onMove = (direction: SceneMoveDirection) => {
        wsClient.send({ direction });
    };

    const getSceneClass = () => {
        switch (view) {
            case GameView.Dialogue:
            case GameView.ShopBuy:
            case GameView.ShopSell:
                return 'blur';
            case GameView.World:
                return '';
            default:
                return 'gone';
        }
    };

    return <section id="sceneWrapper" className={getSceneClass()}></section>;
};
