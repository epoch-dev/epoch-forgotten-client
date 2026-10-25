import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
    io: vi.fn(() => ({ connected: false })),
}));

vi.mock('socket.io-client', () => ({
    io: mocks.io,
}));

import {
    createSceneSocket,
    SCENE_SOCKET_RECONNECTION_ATTEMPTS,
} from '../../../src/views/scenes/sceneSocket';

describe('createSceneSocket', () => {
    it('creates an authenticated Socket.IO client', () => {
        const socket = createSceneSocket('access-token');

        expect(socket).toEqual({ connected: false });
        expect(mocks.io).toHaveBeenCalledOnce();
        expect(mocks.io).toHaveBeenCalledWith('ws://localhost:3013', {
            extraHeaders: {
                authorization: 'Bearer access-token',
            },
            reconnectionAttempts: SCENE_SOCKET_RECONNECTION_ATTEMPTS,
        });
    });
});
