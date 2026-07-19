import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SceneMoveDirection } from '../../../src/common/api/definitions/sceneTypes';
import { GameView } from '../../../src/views/game/types';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
    true;

type SceneRendererOptions = {
    onMove: (direction: SceneMoveDirection) => void;
};

const mocks = vi.hoisted(() => ({
    accessToken: 'access-token',
    createSceneSocket: vi.fn(),
    disconnect: vi.fn(),
    gameDestroy: vi.fn(),
    initialize: vi.fn(),
    handlers: new Map<string, (...args: unknown[]) => void>(),
    moveUser: vi.fn(),
    removeAllListeners: vi.fn(),
    rendererOptions: undefined as SceneRendererOptions | undefined,
    send: vi.fn(),
    setScene: vi.fn(),
    toastError: vi.fn(),
    socket: {
        connected: false,
        connect: vi.fn(),
        on: vi.fn(),
        send: vi.fn(),
        removeAllListeners: vi.fn(),
        disconnect: vi.fn(),
    },
}));

vi.mock('../../../src/views/scenes/sceneSocket', () => ({
    createSceneSocket: mocks.createSceneSocket,
}));

vi.mock('../../../src/common/services/StorageService', () => ({
    StorageService: {
        get: () => ({ accessToken: mocks.accessToken }),
    },
}));

vi.mock('../../../src/common/services/ToastService', () => ({
    ToastService: {
        error: mocks.toastError,
    },
}));

vi.mock('../../../src/views/scenes/ScenesService', () => ({
    ScenesService: {
        initialize: mocks.initialize,
        getUserPosition: vi.fn(),
    },
}));

vi.mock('../../../src/views/scenes/SceneRenderer', () => ({
    SceneRenderer: class {
        public blockMovement = false;
        public moveUser = mocks.moveUser;

        constructor(options: SceneRendererOptions) {
            mocks.rendererOptions = options;
        }
    },
}));

vi.mock('../../../src/views/game/GameStore', () => ({
    useGameStore: () => ({
        scene: undefined,
        view: GameView.World,
        setScene: mocks.setScene,
        setView: vi.fn(),
        setEncounter: vi.fn(),
        setNpcName: vi.fn(),
    }),
}));

import { ScenesComponent } from '../../../src/views/scenes/ScenesComponent';

let container: HTMLDivElement;
let root: Root | undefined;

describe('ScenesComponent socket lifecycle', () => {
    beforeEach(() => {
        mocks.accessToken = 'access-token';
        mocks.handlers.clear();
        mocks.rendererOptions = undefined;
        mocks.createSceneSocket.mockReset().mockReturnValue(mocks.socket);
        mocks.socket.connected = false;
        mocks.socket.connect.mockReset();
        mocks.socket.on.mockReset().mockImplementation(
            (event: string, handler: (...args: unknown[]) => void) => {
                mocks.handlers.set(event, handler);
                return mocks.socket;
            },
        );
        mocks.socket.send.mockReset();
        mocks.socket.removeAllListeners.mockReset();
        mocks.socket.disconnect.mockReset();
        mocks.gameDestroy.mockReset();
        mocks.initialize.mockReset().mockResolvedValue(undefined);
        mocks.setScene.mockReset();
        mocks.toastError.mockReset();

        class Game {
            public destroy = mocks.gameDestroy;
        }
        (
            globalThis as unknown as {
                Phaser: {
                    Game: typeof Game;
                    Scale: { FIT: string; CENTER_BOTH: string };
                };
            }
        ).Phaser = {
            Game,
            Scale: { FIT: 'FIT', CENTER_BOTH: 'CENTER_BOTH' },
        };
    });

    afterEach(async () => {
        if (root) {
            const mountedRoot = root;
            await act(async () => mountedRoot.unmount());
            root = undefined;
        }
        container?.remove();
    });

    it('initializes HTTP auth before creating one socket and disconnects on cleanup', async () => {
        container = document.createElement('div');
        document.body.append(container);
        const createdRoot = createRoot(container);
        root = createdRoot;

        await act(async () => {
            createdRoot.render(<ScenesComponent />);
        });

        expect(mocks.createSceneSocket).toHaveBeenCalledOnce();
        expect(mocks.createSceneSocket).toHaveBeenCalledWith('access-token');
        expect(mocks.initialize.mock.invocationCallOrder[0]).toBeLessThan(
            mocks.createSceneSocket.mock.invocationCallOrder[0] ?? Number.POSITIVE_INFINITY,
        );
        expect(mocks.handlers.has('connect_error')).toBe(true);
        expect(mocks.handlers.has('connection_error')).toBe(false);

        mocks.handlers.get('connect_error')?.(new Error('offline'));
        expect(mocks.toastError).toHaveBeenCalledWith({ message: 'offline' });
        expect(mocks.createSceneSocket).toHaveBeenCalledOnce();

        await act(async () => createdRoot.unmount());
        root = undefined;
        expect(mocks.socket.removeAllListeners).toHaveBeenCalledOnce();
        expect(mocks.socket.disconnect).toHaveBeenCalledOnce();
        expect(mocks.gameDestroy).toHaveBeenCalledWith(true);
    });

    it('recreates an authorization-denied socket with the refreshed HTTP token', async () => {
        container = document.createElement('div');
        document.body.append(container);
        const createdRoot = createRoot(container);
        root = createdRoot;

        await act(async () => {
            createdRoot.render(<ScenesComponent />);
        });

        mocks.rendererOptions?.onMove(SceneMoveDirection.Down);
        expect(mocks.socket.connect).toHaveBeenCalledOnce();

        mocks.accessToken = 'refreshed-token';
        await act(async () => {
            mocks.handlers.get('connect_error')?.(new Error('Unauthorized'));
            await Promise.resolve();
        });

        expect(mocks.initialize).toHaveBeenCalledTimes(2);
        expect(mocks.createSceneSocket).toHaveBeenNthCalledWith(2, 'refreshed-token');
        expect(mocks.socket.removeAllListeners).toHaveBeenCalledOnce();
        expect(mocks.socket.disconnect).toHaveBeenCalledOnce();
        expect(mocks.toastError).not.toHaveBeenCalled();

        mocks.socket.connected = true;
        mocks.handlers.get('connect')?.();
        expect(mocks.socket.send).toHaveBeenCalledWith({
            direction: SceneMoveDirection.Down,
        });
    });

    it('reconnects and sends the pending movement once connected', async () => {
        container = document.createElement('div');
        document.body.append(container);
        const createdRoot = createRoot(container);
        root = createdRoot;
        await act(async () => {
            createdRoot.render(<ScenesComponent />);
        });

        mocks.rendererOptions?.onMove(SceneMoveDirection.Up);
        expect(mocks.socket.send).not.toHaveBeenCalled();
        expect(mocks.socket.connect).toHaveBeenCalledOnce();

        mocks.socket.connected = true;
        mocks.handlers.get('connect')?.();
        expect(mocks.socket.send).toHaveBeenCalledWith({ direction: SceneMoveDirection.Up });
    });
});
