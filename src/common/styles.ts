export const CSS_COLOR = {
    PRIMARY: 'rgb(131 101 94)',
    LIGHT: 'rgb(223 221 220)',
    GREY: 'rgb(85, 85, 85)',
    DARK: 'rgb(24 30 42)',
    ERROR: 'rgb(199 62 54)',
    SUCCESS: 'rgb(55 188 54)',
    COMMON: 'rgb(200, 200, 200)',
    RARE: 'rgb(30, 144, 255)',
    UNIQUE: 'rgb(238, 130, 238)',
    EPIC: 'rgb(218, 165, 32)',
    MYTHICAL: 'rgb(255, 69, 0)',
} as const;

export type CssColor = (typeof CSS_COLOR)[keyof typeof CSS_COLOR];
