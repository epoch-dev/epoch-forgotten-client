import { beforeEach, describe, expect, it, vi } from 'vitest';

type RejectionHandler = (error: {
    status: number;
    config: { headers: Record<string, string> };
}) => Promise<unknown>;

const mocks = vi.hoisted(() => {
    const axiosRequest = vi.fn();
    return {
        axios: Object.assign(axiosRequest, {
            defaults: { headers: { common: {} as Record<string, string> } },
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
        }),
        refreshToken: vi.fn(),
        rejectedHandler: undefined as RejectionHandler | undefined,
        signout: vi.fn(),
        storageSet: vi.fn(),
    };
});

vi.mock('axios', () => ({
    default: mocks.axios,
}));

vi.mock('../../../src/common/api/.generated', () => {
    class Api {
        public refreshToken = mocks.refreshToken;
    }
    return {
        BattleApi: Api,
        CharactersApi: Api,
        ItemsApi: Api,
        NpcsApi: Api,
        QuestsApi: Api,
        ScenesApi: Api,
        SkillsApi: Api,
        UsersApi: Api,
    };
});

vi.mock('../../../src/common/services/StorageService', () => ({
    StorageService: {
        get: () => ({
            accessToken: 'expired-token',
            refreshToken: 'refresh-token',
            username: 'player',
        }),
        set: mocks.storageSet,
    },
}));

vi.mock('../../../src/common/services/ToastService', () => ({
    ToastService: {
        error: vi.fn(),
    },
}));

vi.mock('../../../src/common/utils', () => ({
    signout: mocks.signout,
}));

await import('../../../src/common/api/client');

describe('API refresh interceptor', () => {
    beforeEach(() => {
        mocks.axios.mockReset();
        mocks.refreshToken.mockReset();
        mocks.signout.mockReset();
        mocks.storageSet.mockReset();
        const responseUseCall = mocks.axios.interceptors.response.use.mock.calls[0];
        mocks.rejectedHandler = responseUseCall?.[1] as RejectionHandler | undefined;
    });

    it('signs out and rejects the original refresh failure', async () => {
        const refreshError = new Error('refresh denied');
        mocks.refreshToken.mockRejectedValue(refreshError);
        const requestError = {
            status: 401,
            config: { headers: { Authorization: 'Bearer expired-token' } },
        };

        await expect(mocks.rejectedHandler?.(requestError)).rejects.toBe(refreshError);

        expect(mocks.signout).toHaveBeenCalledOnce();
        expect(mocks.axios).not.toHaveBeenCalled();
    });

    it('stores the refreshed token and retries the original request', async () => {
        mocks.refreshToken.mockResolvedValue({ data: 'new-token' });
        mocks.axios.mockResolvedValue({ data: 'retried' });
        const config = { headers: { Authorization: 'Bearer expired-token' } };

        await expect(mocks.rejectedHandler?.({ status: 401, config })).resolves.toEqual({
            data: 'retried',
        });

        expect(config.headers.Authorization).toBe('Bearer new-token');
        expect(mocks.storageSet).toHaveBeenCalledWith({
            key: 'user',
            data: {
                accessToken: 'new-token',
                refreshToken: 'refresh-token',
                username: 'player',
            },
        });
        expect(mocks.axios).toHaveBeenCalledWith(config);
        expect(mocks.signout).not.toHaveBeenCalled();
    });
});
