import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export const BASE_PATH = '/epoch-forgotten-client';

// https://vitejs.dev/config/
export default defineConfig({
    base: BASE_PATH,
    plugins: [react()],
});
