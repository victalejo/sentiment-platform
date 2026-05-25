import js from '@eslint/js';
import globals from 'globals';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';

// Configuración flat de ESLint 9 (antes no existía ningún config y `npm run lint`
// fallaba). Se mantiene el patrón clásico de React (import React en cada archivo),
// por lo que se conserva `react-in-jsx-scope`. prop-types se desactiva porque el
// proyecto no usa PropTypes.
export default [
    { ignores: ['dist', 'node_modules'] },
    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        settings: { react: { version: '18.3' } },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/prop-types': 'off',
            'react/jsx-no-target-blank': 'off',
            'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },
];
