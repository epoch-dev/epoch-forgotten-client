export const BASE_PATH = 'epoch-forgotten-client'
const ICONS = {
    USER: 'user-icon.png',
    SKILLS: 'skills-icon.svg',
    EQUIPMENT: 'equipment-icon.svg',
    PLUS: 'plus-icon.svg',
    BLANK: 'blank-icon.png',
    SHOP: 'shop-icon.svg',
} as const;

type IconName = keyof typeof ICONS;

export class AssetsService {
    private static ICONS_BASE_URI = 'images/icons';
    private static SCENES_BASE_URI = 'images/scenes';
    private static MUSIC_BASE_URI = 'audio/music';
    private static SOUNDS_BASE_URI = 'audio/sounds';
    private static CHARACTERS_BASE_URI = 'images/characters';
    private static ENEMIES_BASE_URI = 'images/enemies';
    private static SKILLS_BASE_URI = 'images/skills';
    private static ITEMS_BASE_URI = 'images/items';

    public static getIcon(iconName: IconName) {
        return `${BASE_PATH}/${this.ICONS_BASE_URI}/${ICONS[iconName]}`;
    }

    public static getSceneUri(sceneName: string) {
        return `${BASE_PATH}/${this.SCENES_BASE_URI}/${sceneName}`;
    }

    public static getMusicUri(musicName: string) {
        return `${BASE_PATH}/${this.MUSIC_BASE_URI}/${musicName}`;
    }

    public static getSoundUri(soundName: string) {
        return `${BASE_PATH}/${this.SOUNDS_BASE_URI}/${soundName}`;
    }

    public static getCharacterUri(characterImageUri: string) {
        return `${BASE_PATH}/${this.CHARACTERS_BASE_URI}/${characterImageUri}`;
    }

    public static getEnemyUri(enemyImageUri: string) {
        return `${BASE_PATH}/${this.ENEMIES_BASE_URI}/${enemyImageUri}`;
    }

    public static getSkillUri(skillUri: string) {
        return `${BASE_PATH}/${this.SKILLS_BASE_URI}/${skillUri}`;
    }

    public static getItemUri(itemUri: string) {
        return `${BASE_PATH}/${this.ITEMS_BASE_URI}/${itemUri}`;
    }
}
