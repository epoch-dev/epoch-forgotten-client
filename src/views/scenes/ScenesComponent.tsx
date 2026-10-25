import { useEffect, useState } from 'react';
import { SceneRenderer } from './SceneRenderer';
import { ScenesService } from './ScenesService';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { StorageService } from '../../common/services/StorageService';
import { ToastService } from '../../common/services/ToastService';
import {
    SceneMoveDirection,
    SceneMoveResultDto,
} from '../../common/api/definitions/sceneTypes';
import { createSceneSocket } from './sceneSocket';
import type { Socket } from 'socket.io-client';
import { refreshAccessToken } from '../../common/api/mutator';
import style from './ScenesComponent.module.scss';

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
    const { scene, view, setScene, setView, setEncounter, setNpcName: setNpc } = useGameStore();
    const [connectionError, setConnectionError] = useState<string>();

    useEffect(() => {
        let disposed = false;
        let game: Phaser.Game | undefined;
        let wsClient: Socket | undefined;
        let pendingDirection: SceneMoveDirection | undefined;
        let connectionErrorReported = false;
        let authorizationRetried = false;
        let removeReconnectFailedListener: (() => void) | undefined;

        const reportConnectionError = (message: string) => {
            if (disposed || connectionErrorReported) {
                return;
            }
            connectionErrorReported = true;
            setConnectionError(message);
        };

        if (!StorageService.get('user')) {
            reportConnectionError('Unable to connect to the world.');
            return;
        }

        const renderedScene = new SceneRenderer({
            onMove: (direction) => {
                if (!wsClient) {
                    return;
                }
                if (!wsClient.connected) {
                    pendingDirection = direction;
                    wsClient.connect();
                    return;
                }
                wsClient.send({ direction });
            },
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

        const connect = (authToken: string) => {
            removeReconnectFailedListener?.();
            const socket = createSceneSocket(authToken);
            wsClient = socket;
            socket.on('connect', () => {
                connectionErrorReported = false;
                authorizationRetried = false;
                setConnectionError(undefined);
                if (pendingDirection === undefined) {
                    return;
                }
                socket.send({ direction: pendingDirection });
                pendingDirection = undefined;
            });
            socket.on('message', async (wsData: string) => {
                if (!isSceneMoveResult(wsData)) {
                    ToastService.error({ message: wsData });
                    return;
                }
                const moveResult: SceneMoveResultDto = JSON.parse(wsData);
                ScenesService.userPosition = moveResult.newPosition;
                if (moveResult.newSceneData) {
                    await ScenesService.initialize();
                }
                const newPosition = await ScenesService.getUserPosition();
                if (disposed) {
                    return;
                }
                renderedScene.moveUser({
                    newPosition,
                    sceneChanged: moveResult.newSceneData !== undefined,
                    encounter: moveResult.encounterData,
                    npc: moveResult.npcData,
                });
            });
            const handleReconnectFailed = () => {
                reportConnectionError('Unable to reconnect to the world.');
            };
            socket.io.on('reconnect_failed', handleReconnectFailed);
            removeReconnectFailedListener = () => {
                socket.io.off('reconnect_failed', handleReconnectFailed);
            };
            socket.on('connect_error', (error: Error) => {
                if (disposed) {
                    return;
                }
                if (error.message !== 'Unauthorized') {
                    if (!socket.active) {
                        reportConnectionError(error.message || 'Unable to connect to the world.');
                    }
                    return;
                }
                if (authorizationRetried) {
                    reportConnectionError('Unable to connect to the world.');
                    return;
                }
                authorizationRetried = true;
                void refreshAccessToken()
                    .then((refreshedToken) => {
                        if (disposed) {
                            return;
                        }
                        removeReconnectFailedListener?.();
                        socket.removeAllListeners();
                        socket.disconnect();
                        connect(refreshedToken);
                    })
                    .catch((refreshError: unknown) => {
                        reportConnectionError(
                            refreshError instanceof Error
                                ? refreshError.message
                                : 'Unable to connect to the world.',
                        );
                    });
            });
        };

        void ScenesService.initialize()
            .then(() => {
                if (disposed) {
                    return;
                }
                ScenesService.openPendingDialogue();
                const authToken = StorageService.get('user')?.accessToken;
                if (!authToken) {
                    throw new Error('Unable to connect to the world.');
                }
                connect(authToken);
                game = new Phaser.Game({
                    scene: renderedScene,
                    physics: {
                        default: 'arcade',
                        arcade: {
                            gravity: { x: 0, y: 0 },
                        },
                    },
                    scale: {
                        parent: 'sceneWrapper',
                        mode: Phaser.Scale.FIT,
                        autoCenter: Phaser.Scale.CENTER_BOTH,
                        width: 1450,
                        height: 750,
                    },
                });
                setScene(renderedScene);
            })
            .catch((error: unknown) => {
                ToastService.error({
                    message:
                        error instanceof Error ? error.message : 'Unable to connect to the world.',
                });
            });

        return () => {
            disposed = true;
            game?.destroy(true);
            removeReconnectFailedListener?.();
            wsClient?.removeAllListeners();
            wsClient?.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!scene) {
            return;
        }
        if (view === GameView.World) {
            scene.blockMovement = false;
        } else {
            scene.blockMovement = true;
        }
    }, [view]);

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

    return (
        <section id="sceneWrapper" className={getSceneClass()}>
            {connectionError ? (
                <p className={style.connectionError} role="status">
                    {connectionError}
                </p>
            ) : null}
        </section>
    );
};
