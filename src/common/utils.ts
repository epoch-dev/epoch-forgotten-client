export const isEmpty = (obj: Record<string, string>) => {
    return Object.keys(obj).length === 0;
};

export const getCurrentTimeStamp = () => {
    return new Date().getTime();
};
