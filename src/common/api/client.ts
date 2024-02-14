import axios from 'axios';
import { ItemsApi, UsersApi } from './.generated';
import { API_PATH } from '../config';

const BASE_PATH = API_PATH;

type ApiError = {
    name: string;
    code: string;
    message: string;
};

axios.interceptors.request.use((req) => {
    const authToken = 'TODO - get from storage service';
    req.headers['Authorization'] = `Bearer ${authToken}`;
    return req;
});

axios.interceptors.response.use(
    (res) => res,
    (err: ApiError) => {
        console.log('TODO - add toast service');
        return Promise.reject(err);
    },
);

export const UsersClient = new UsersApi(undefined, BASE_PATH, axios);
export const ItemsClient = new ItemsApi(undefined, BASE_PATH, axios);
