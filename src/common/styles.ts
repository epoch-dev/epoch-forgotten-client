export const CSS_COLOR = {
    // Legacy colors (kept for backwards compatibility)
    PRIMARY: 'rgb(131 101 94)',
    LIGHT: 'rgb(223 221 220)',
    GREY: 'rgb(85, 85, 85)',
    DARK: 'rgb(24 30 42)',
    ERROR: 'rgb(199 62 54)',
    SUCCESS: 'rgb(55 188 54)',

    // Rarity colors
    COMMON: 'rgb(200, 200, 200)',
    UNCOMMON: 'rgb(60, 179, 113)',
    RARE: 'rgb(30, 144, 255)',
    UNIQUE: 'rgb(238, 130, 238)',
    EPIC: 'rgb(218, 165, 32)',
    MYTHICAL: 'rgb(255, 69, 0)',

    // Dark Fantasy Theme colors
    UI_BG: 'rgba(18, 18, 24, 0.95)',
    UI_BG_SOLID: 'rgb(18, 18, 24)',
    UI_BORDER: '#8a7f6b',
    UI_BORDER_ACTIVE: '#c8aa6e',
    TEXT_PRIMARY: '#e0e0e0',
    TEXT_SECONDARY: '#9a9a9a',
    TEXT_HIGHLIGHT: '#ffcc00',

    // Stat bar colors
    HEALTH: 'rgb(180, 50, 50)',
    MANA: 'rgb(50, 100, 180)',
    EXP: 'rgb(180, 140, 50)',
} as const;

export type CssColor = (typeof CSS_COLOR)[keyof typeof CSS_COLOR];
