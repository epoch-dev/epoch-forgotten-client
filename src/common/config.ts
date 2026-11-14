export const appConfig = {
    apiUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:3013',
    assetsPath: import.meta.env.VITE_ASSETS_PATH ?? './',
    moveInterval: 200,
    reportIssueLink: 'https://github.com/epoch-dev/epoch-forgotten-client/issues/new?assignees=&labels=bug&projects=&template=bug_report.md&title=',
};
