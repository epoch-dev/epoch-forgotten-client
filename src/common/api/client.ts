import axios, { AxiosError } from 'axios';
import {
    CharactersApi,
    ItemsApi,
    ScenesApi,
    NpcsApi,
    UsersApi,
    SkillsApi,
    QuestsApi,
    BattleApi,
} from './.generated';
import { appConfig } from '../config';
import { ToastService } from '../services/ToastService';
import { StorageService } from '../services/StorageService';
import { signout } from '../utils';

type ApiError = {
    name: string;
    code: string;
    message: string;
};

axios.interceptors.request.use((req) => {
    const authToken = StorageService.get('user')?.accessToken;
    req.headers['Authorization'] = `Bearer ${authToken}`;
    return req;
});

axios.interceptors.response.use(
    (res) => res,
    async (err: AxiosError<ApiError>) => {
        if (err.status === 401 && err.config) {
            const user = StorageService.get('user');
            if (!user || !user.refreshToken) {
                return signout();
            }
            try {
                const tokenData = await usersClient.refreshToken({ refreshToken: user.refreshToken });
                StorageService.set({
                    key: 'user',
                    data: {
                        ...user,
                        accessToken: tokenData.data,
                    },
                });
                err.config.headers['Authorization'] = `Bearer ${tokenData.data}`;
                return axios(err.config);
            } catch {
                signout();
            }
        } else {
            ToastService.error({ message: err.response?.data.message ?? 'errors.unknownError' });
            return Promise.reject(err);
        }
    },
);

export const usersClient = new UsersApi(undefined, appConfig.apiUrl, axios);
export const itemsClient = new ItemsApi(undefined, appConfig.apiUrl, axios);
export const scenesClient = new ScenesApi(undefined, appConfig.apiUrl, axios);
export const charactersClient = new CharactersApi(undefined, appConfig.apiUrl, axios);
export const npcsClient = new NpcsApi(undefined, appConfig.apiUrl, axios);
export const skillsClient = new SkillsApi(undefined, appConfig.apiUrl, axios);
export const battleClient = new BattleApi(undefined, appConfig.apiUrl, axios);
export const questsClient = new QuestsApi(undefined, appConfig.apiUrl, axios);
