export const isEmpty = (obj: Record<string, string>) => {
    return Object.keys(obj).length === 0;
};

export const getCurrentTimeStamp = () => {
    return new Date().getTime();
};

export const wait = (durationMs: number) => {
    return new Promise((resolve) => setTimeout(resolve, durationMs));
};

export const generateRandomId = () => {
    return Array.from({ length: 12 }, () => Math.floor(Math.random() * 10)).join('');
};
