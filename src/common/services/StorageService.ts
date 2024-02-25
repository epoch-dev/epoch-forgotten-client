import { UserSignedDto } from '../api/.generated';

type StorageData = {
    user: UserSignedDto;
};

type StorageKey = keyof StorageData;

export class StorageService {
    public static set<K extends StorageKey>({ key, data }: { key: StorageKey; data: StorageData[K] }) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    public static get<K extends StorageKey>(key: K): StorageData[K] | undefined {
        const rawData = localStorage.getItem(key);
        return rawData ? JSON.parse(rawData) : undefined;
    }

    public static clear() {
        localStorage.clear();
    }
}
