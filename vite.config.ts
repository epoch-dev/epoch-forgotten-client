import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
    base: `${mode === 'stage' ? '/stage' : ''}/epoch-forgotten-client/`,
    plugins: [react()],
    envDir: './',
}));
