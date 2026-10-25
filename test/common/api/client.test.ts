import { beforeEach, describe, expect, it, vi } from 'vitest';

type RejectionHandler = (error: {
    response?: { data?: { message?: string }; status: number };
    config?: { headers: Record<string, string>; retryAfterRefresh?: boolean };
}) => Promise<unknown>;

const mocks = vi.hoisted(() => {
    const apiRequest = vi.fn();
    const refreshApi = {
        defaults: { headers: { common: {} as Record<string, string> } },
        post: vi.fn(),
    };
    return {
        api: Object.assign(apiRequest, {
            defaults: { headers: { common: {} as Record<string, string> } },
            interceptors: {
                request: { use: vi.fn() },
                response: { use: vi.fn() },
            },
        }),
        refreshApi,
        rejectedHandler: undefined as RejectionHandler | undefined,
        signout: vi.fn(),
        storageSet: vi.fn(),
        toastError: vi.fn(),
    };
});

vi.mock('axios', () => ({
    default: Object.assign(vi.fn(), {
        create: vi
            .fn()
            .mockReturnValueOnce(mocks.api)
            .mockReturnValueOnce(mocks.refreshApi),
    }),
}));

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
        error: mocks.toastError,
    },
}));

vi.mock('../../../src/common/utils', () => ({
    signout: mocks.signout,
}));

const { refreshAccessToken } = await import('../../../src/common/api/mutator');

describe('API refresh interceptor', () => {
    beforeEach(() => {
        mocks.api.mockReset();
        mocks.refreshApi.post.mockReset();
        mocks.signout.mockReset();
        mocks.storageSet.mockReset();
        mocks.toastError.mockReset();
        const responseUseCall = mocks.api.interceptors.response.use.mock.calls[0];
        mocks.rejectedHandler = responseUseCall?.[1] as RejectionHandler | undefined;
    });

    it('signs out and rejects the refresh failure', async () => {
        const refreshError = new Error('refresh denied');
        mocks.refreshApi.post.mockRejectedValue(refreshError);
        const requestError = {
            response: { status: 401 },
            config: { headers: { Authorization: 'Bearer expired-token' } },
        };

        await expect(mocks.rejectedHandler?.(requestError)).rejects.toBe(refreshError);

        expect(mocks.signout).toHaveBeenCalledOnce();
        expect(mocks.api).not.toHaveBeenCalled();
    });

    it('stores the refreshed token and retries the original request', async () => {
        mocks.refreshApi.post.mockResolvedValue({ data: 'new-token' });
        mocks.api.mockResolvedValue({ data: 'retried' });
        const config = { headers: { Authorization: 'Bearer expired-token' } };

        await expect(mocks.rejectedHandler?.({ response: { status: 401 }, config })).resolves.toEqual({
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
        expect(mocks.refreshApi.post).toHaveBeenCalledWith('/users/refreshToken', {
            refreshToken: 'refresh-token',
        });
        expect(mocks.api).toHaveBeenCalledWith(config);
        expect(mocks.signout).not.toHaveBeenCalled();
    });

    it('shares one refresh request across concurrent callers', async () => {
        let resolveRefresh: ((value: { data: string }) => void) | undefined;
        mocks.refreshApi.post.mockReturnValue(
            new Promise<{ data: string }>((resolve) => {
                resolveRefresh = resolve;
            }),
        );

        const first = refreshAccessToken();
        const second = refreshAccessToken();

        expect(second).toBe(first);
        expect(mocks.refreshApi.post).toHaveBeenCalledOnce();
        resolveRefresh?.({ data: 'shared-token' });
        await expect(first).resolves.toBe('shared-token');
    });

    it('does not refresh a retried unauthorized request', async () => {
        const error = {
            response: { status: 401 },
            config: {
                headers: { Authorization: 'Bearer expired-token' },
                retryAfterRefresh: true,
            },
        };

        await expect(mocks.rejectedHandler?.(error)).rejects.toBe(error);

        expect(mocks.refreshApi.post).not.toHaveBeenCalled();
        expect(mocks.signout).toHaveBeenCalledOnce();
    });

    it('does not toast conflict responses', async () => {
        const error = {
            response: { status: 409, data: { message: 'conflict' } },
            config: { headers: {} },
        };

        await expect(mocks.rejectedHandler?.(error)).rejects.toBe(error);

        expect(mocks.toastError).not.toHaveBeenCalled();
        expect(mocks.signout).not.toHaveBeenCalled();
    });
});
