import { useEffect } from 'react';
import { SceneRenderer } from './SceneRenderer';
import { ScenesService } from './ScenesService';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { io } from 'socket.io-client';
import { WS_PATH } from '../../common/config';
import { StorageService } from '../../common/services/StorageService';
import { SceneMoveDirection, SceneMoveResultDto } from '../../common/api/.generated';

let wsClient = io(WS_PATH);

export const ScenesComponent = () => {
    const { view, setScene, setView, setEncounter, setNpc } = useGameStore();

    useEffect(() => {
        ScenesService.initialize();
        const scene = new SceneRenderer({
            onMove,
            onEncounter: (encounter) => {
                setView(GameView.Battle);
                setEncounter(encounter);
            },
            onNpc: (npc) => {
                setView(GameView.Dialogue);
                setNpc(npc);
            },
        });
        const game = new Phaser.Game({
            width: 1100,
            height: 600,
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
        wsClient = io(WS_PATH, { extraHeaders: { authorization: `Bearer ${authToken}` } });
        wsClient.on('message', async (moveResultRaw: string) => {
            const moveResult = JSON.parse(moveResultRaw) as SceneMoveResultDto;
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
