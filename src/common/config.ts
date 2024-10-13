export const appConfig = {
    apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3013',
    assetsPath: import.meta.env.VITE_ASSETS_PATH ?? './',
    moveInterval: 200,
};
