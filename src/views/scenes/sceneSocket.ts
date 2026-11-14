import { io, type Socket } from 'socket.io-client';
import { appConfig } from '../../common/config';

const wsUrl = appConfig.apiUrl.replace(/^http/, 'ws');
export const SCENE_SOCKET_RECONNECTION_ATTEMPTS = 3;

export function createSceneSocket(authToken: string): Socket {
    return io(wsUrl, {
        extraHeaders: { authorization: `Bearer ${authToken}` },
        reconnectionAttempts: SCENE_SOCKET_RECONNECTION_ATTEMPTS,
    });
}
