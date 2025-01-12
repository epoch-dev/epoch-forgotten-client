import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    base: `/epoch-forgotten-client/${mode === 'stage' ? 'stage' : ''}`,
    plugins: [react()],
    envDir: './',
}));
