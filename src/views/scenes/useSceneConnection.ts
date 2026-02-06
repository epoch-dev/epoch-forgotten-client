import { useCallback, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SceneMoveDirection, SceneMoveResultDto } from '../../common/api/definitions/sceneTypes';
import { appConfig, AppProfiles } from '../../common/config';
import { StorageService } from '../../common/services/StorageService';
import { ToastService } from '../../common/services/ToastService';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { SceneRenderer } from './SceneRenderer';
import { ScenesService } from './ScenesService';

const WS_URL = appConfig.apiUrl.replace(/^http/, 'ws');
const EXTRA_HEADERS: Record<string, string> = appConfig.profile === AppProfiles.Stage
    ? { 'ngrok-skip-browser-warning': 'true' }
    : {};

const isSceneMoveResult = (data: unknown): data is SceneMoveResultDto => {
    try {
        const obj = JSON.parse(data as string);
        return obj !== null && typeof obj === 'object' && 'newPosition' in obj;
    } catch {
        return false;
    }
};

export const useSceneConnection = () => {
    const { scene, view, setScene, setView, setEncounter, setNpcName } = useGameStore();
    const gameRef = useRef<Phaser.Game | null>(null);
    const wsRef = useRef<Socket | null>(null);

    const getActualFps = useCallback(() => gameRef.current?.loop.actualFps ?? 0, []);

    useEffect(() => {
        void ScenesService.initialize();

        const sceneRenderer = new SceneRenderer({
            onMove: handleMove,
            onEncounter: (encounter) => {
                if (encounter) {
                    setView(GameView.Battle);
                    setEncounter(encounter);
                }
            },
            onNpc: (npc) => {
                if (npc) {
                    setView(GameView.Dialogue);
                    setNpcName(npc.npcName);
                }
            },
        });

        const game = new Phaser.Game({
            width: 1450,
            height: 750,
            scene: sceneRenderer,
            physics: { default: 'arcade', arcade: { gravity: { x: 0, y: 0 } } },
            parent: 'sceneWrapper',
        });

        gameRef.current = game;
        setScene(sceneRenderer);
        setupWebSocket(sceneRenderer);

        return () => {
            game.destroy(true);
            wsRef.current?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (scene) {
            scene.blockMovement = view !== GameView.World;
        }
    }, [scene, view]);

    const setupWebSocket = (sceneRenderer: SceneRenderer) => {
        const authToken = StorageService.get('user')?.accessToken;
        const headers = { authorization: `Bearer ${authToken}`, ...EXTRA_HEADERS };

        wsRef.current = io(WS_URL, { extraHeaders: headers });

        wsRef.current.on('message', async (wsData: string) => {
            if (!isSceneMoveResult(wsData)) {
                ToastService.error({ message: wsData });
                return;
            }
            const moveResult: SceneMoveResultDto = JSON.parse(wsData);
            ScenesService.userPosition = moveResult.newPosition;

            if (moveResult.newSceneData) {
                await ScenesService.initialize();
            }

            sceneRenderer.moveUser({
                newPosition: await ScenesService.getUserPosition(),
                sceneChanged: moveResult.newSceneData !== undefined,
                encounter: moveResult.encounterData,
                npc: moveResult.npcData,
            });
        });

        wsRef.current.on('connect_error', () => {
            wsRef.current = io(WS_URL, { extraHeaders: headers });
        });
    };

    const handleMove = (direction: SceneMoveDirection) => {
        wsRef.current?.send({ direction });
    };

    return {
        view,
        getActualFps,
    };
};
