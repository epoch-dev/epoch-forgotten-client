import axios, { AxiosError } from 'axios';
import { CharactersApi, ItemsApi, ScenesApi, NpcsApi, UsersApi, SkillsApi, BattleApi, QuestsApi } from './.generated';
import { API_PATH } from '../config';
import { ToastService } from '../services/ToastService';
import { StorageService } from '../services/StorageService';

const BASE_PATH = API_PATH;

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
    (err: AxiosError<ApiError>) => {
        console.log(err);
        ToastService.error({ message: err.response?.data.message || 'errors.unknownError' });
        return Promise.reject(err);
    },
);

export const UsersClient = new UsersApi(undefined, BASE_PATH, axios);
export const ItemsClient = new ItemsApi(undefined, BASE_PATH, axios);
export const ScenesClient = new ScenesApi(undefined, BASE_PATH, axios);
export const CharactersClient = new CharactersApi(undefined, BASE_PATH, axios);
export const NpcsClient = new NpcsApi(undefined, BASE_PATH, axios);
export const SkillsClient = new SkillsApi(undefined, BASE_PATH, axios);
export const battleClient = new BattleApi(undefined, BASE_PATH, axios);
export const questsClient = new QuestsApi(undefined, BASE_PATH, axios);
