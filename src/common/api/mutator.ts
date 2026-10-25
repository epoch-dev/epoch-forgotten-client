import axios, { type AxiosError, type AxiosRequestConfig } from 'axios';
import { appConfig, AppProfiles } from '../config';
import { ToastService } from '../services/ToastService';
import { StorageService } from '../services/StorageService';
import { signout } from '../utils';

type ApiError = {
    name: string;
    code: string;
    message: string;
};

type RetryableRequestConfig = AxiosRequestConfig & {
    retryAfterRefresh?: boolean;
};

let refreshPromise: Promise<string> | undefined;

const api = axios.create({
    baseURL: appConfig.apiUrl,
});
const refreshApi = axios.create({
    baseURL: appConfig.apiUrl,
});

if (appConfig.profile === AppProfiles.Stage) {
    api.defaults.headers.common['ngrok-skip-browser-warning'] = true;
    refreshApi.defaults.headers.common['ngrok-skip-browser-warning'] = true;
}

api.interceptors.request.use((config) => {
    const authToken = StorageService.get('user')?.accessToken;
    config.headers.Authorization = `Bearer ${authToken}`;
    return config;
});

export const refreshAccessToken = (): Promise<string> => {
    if (refreshPromise) {
        return refreshPromise;
    }
    const user = StorageService.get('user');
    if (!user?.refreshToken) {
        signout();
        return Promise.reject(new Error('No refresh token available'));
    }
    refreshPromise = refreshApi
        .post<string>('/users/refreshToken', {
            refreshToken: user.refreshToken,
        })
        .then((response) => {
            StorageService.set({
                key: 'user',
                data: {
                    ...user,
                    accessToken: response.data,
                },
            });
            return response.data;
        })
        .catch((error: unknown) => {
            signout();
            throw error;
        })
        .finally(() => {
            refreshPromise = undefined;
        });
    return refreshPromise;
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError<ApiError>) => {
        const config = error.config as RetryableRequestConfig | undefined;

        if (error.response?.status === 401 && config && !config.retryAfterRefresh) {
            config.retryAfterRefresh = true;

            try {
                const accessToken = await refreshAccessToken();
                config.headers ??= {};
                config.headers.Authorization = `Bearer ${accessToken}`;
                return api(config);
            } catch (refreshError) {
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 409) {
            return Promise.reject(error);
        }

        if (error.response?.status === 401) {
            signout();
            return Promise.reject(error);
        }

        ToastService.error({ message: error.response?.data.message ?? 'errors.unknownError' });
        return Promise.reject(error);
    },
);

export const request = <T>(config: AxiosRequestConfig): Promise<T> =>
    api(config).then((response) => response.data);

export type ErrorType<Error> = AxiosError<Error>;
export type BodyType<BodyData> = BodyData;
