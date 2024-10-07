import globals from 'globals';
import pluginJs from '@eslint/js';
import tseslint from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';

export default [
    pluginJs.configs.recommended,
    ...tseslint.configs.recommended,
    pluginReact.configs.flat.recommended,
    { files: ['**/*.{js,mjs,cjs,ts,jsx,tsx}'] },
    {
        languageOptions: {
            globals: globals.browser,
            parserOptions: {
                projectService: {
                    allowDefaultProject: ['eslint.config.js'],
                },
                tsconfigRootDir: import.meta.dirname,
            },
        },
    },
    { ignores: ['node_modules/*', 'dist/*', 'public/*', 'src/common/api/.generated/*'] },
    {
        rules: {
            'react/react-in-jsx-scope': 'off',
            indent: ['warn', 4, { SwitchCase: 1, ignoredNodes: ['ConditionalExpression'] }],
            'linebreak-style': 'off',
            quotes: ['warn', 'single'],
            semi: ['error', 'always', { omitLastInOneLineBlock: true }],
            'no-useless-catch': 'off',
            'eol-last': 'error',
            'object-curly-spacing': ['error', 'always'],
            'no-multi-spaces': ['error'],
            eqeqeq: 'error',
            'keyword-spacing': 'warn',
            'comma-dangle': ['error', 'always-multiline'],
            '@typescript-eslint/no-floating-promises': 'error',
            '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
];
