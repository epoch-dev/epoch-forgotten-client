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

export const getLevelExperience = (level: number) => Math.round(0 + 25 * Math.pow(level - 1, 1.73));

export const formatNumber = (value: number) => {
    const formatted = new Intl.NumberFormat('en-US', {
        useGrouping: true,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })
        .format(value)
        .replace(/,/g, ' ');

    return formatted
        .split('')
        .map((character, index) => (index > 3 && !isNaN(+character) && character !== ' ' ? '0' : character))
        .join('');
};
