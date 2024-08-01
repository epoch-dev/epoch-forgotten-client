const { jsx } = require('react/jsx-runtime');

module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
        'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
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
        jsx: {
            ignorePatterns: ['ConditionalExpression'],
        },
    },
};
