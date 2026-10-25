import { io, type Socket } from 'socket.io-client';
import { appConfig, AppProfiles } from '../../common/config';

const wsUrl = appConfig.apiUrl.replace(/^http/, 'ws');
export const SCENE_SOCKET_RECONNECTION_ATTEMPTS = 3;

export function createSceneSocket(authToken: string): Socket {
    const extraHeaders: Record<string, string> = {
        authorization: `Bearer ${authToken}`,
    };
    if (appConfig.profile === AppProfiles.Stage) {
        extraHeaders['ngrok-skip-browser-warning'] = 'true';
    }

    return io(wsUrl, {
        extraHeaders,
        reconnectionAttempts: SCENE_SOCKET_RECONNECTION_ATTEMPTS,
    });
}
