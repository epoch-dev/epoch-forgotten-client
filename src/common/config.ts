export const appConfig = {
    apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3013',
    assetsPath: import.meta.env.VITE_ASSETS_PATH ?? './',
    reportIssueLink:
        'https://github.com/epoch-dev/epoch-forgotten-client/issues/new?assignees=&labels=bug&projects=&template=bug_report.md&title=',
};

// both backend and frontend
export const sharedConfig = {
    moveInterval: 200, // ms
    nameLength: { min: 3, max: 12 },
    passwordLength: { min: 4, max: 20 },
};
