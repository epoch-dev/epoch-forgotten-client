import { appConfig } from '../config';

const ICONS = {
    USER: 'user-icon.png',
    SKILLS: 'skills-icon.svg',
    EQUIPMENT: 'equipment-icon.svg',
    PLUS: 'plus-icon.svg',
    BLANK: 'blank-icon.png',
    SHOP: 'shop-icon.svg',
    ROADMAP: 'roadmap-icon.svg',
    MUTE: 'mute-icon.svg',
    UNMUTE: 'unmute-icon.svg',
} as const;

type IconName = keyof typeof ICONS;

export class AssetsService {
    private static ICONS_BASE_URI = `${appConfig.assetsPath}images/icons`;
    private static SCENES_BASE_URI = `${appConfig.assetsPath}images/scenes`;
    private static MUSIC_BASE_URI = `${appConfig.assetsPath}audio/music`;
    private static SOUNDS_BASE_URI = `${appConfig.assetsPath}audio/sounds`;
    private static CHARACTERS_BASE_URI = `${appConfig.assetsPath}images/characters`;
    private static ENEMIES_BASE_URI = `${appConfig.assetsPath}images/enemies`;
    private static SKILLS_BASE_URI = `${appConfig.assetsPath}images/skills`;
    private static ITEMS_BASE_URI = `${appConfig.assetsPath}images/items`;

    public static getIcon(iconName: IconName) {
        return `${this.ICONS_BASE_URI}/${ICONS[iconName]}`;
    }

    public static getSceneUri(sceneName: string) {
        return `${this.SCENES_BASE_URI}/${sceneName}`;
    }

    public static getMusicUri(musicName: string) {
        return `${this.MUSIC_BASE_URI}/${musicName}`;
    }

    public static getSoundUri(soundName: string) {
        return `${this.SOUNDS_BASE_URI}/${soundName}`;
    }

    public static getCharacterUri(characterImageUri: string) {
        return `${this.CHARACTERS_BASE_URI}/${characterImageUri}`;
    }

    public static getEnemyUri(enemyImageUri: string) {
        return `${this.ENEMIES_BASE_URI}/${enemyImageUri}`;
    }

    public static getSkillUri(skillUri: string) {
        return `${this.SKILLS_BASE_URI}/${skillUri}`;
    }

    public static getItemUri(itemUri: string) {
        return `${this.ITEMS_BASE_URI}/${itemUri}`;
    }
}
