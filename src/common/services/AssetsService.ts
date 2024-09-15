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
        return `${import.meta.env.BASE_URL}/${this.ICONS_BASE_URI}/${ICONS[iconName]}`;
    }

    public static getSceneUri(sceneName: string) {
        return `${import.meta.env.BASE_URL}/${this.SCENES_BASE_URI}/${sceneName}`;
    }

    public static getMusicUri(musicName: string) {
        return `${import.meta.env.BASE_URL}/${this.MUSIC_BASE_URI}/${musicName}`;
    }

    public static getSoundUri(soundName: string) {
        return `${import.meta.env.BASE_URL}/${this.SOUNDS_BASE_URI}/${soundName}`;
    }

    public static getCharacterUri(characterImageUri: string) {
        return `${import.meta.env.BASE_URL}/${this.CHARACTERS_BASE_URI}/${characterImageUri}`;
    }

    public static getEnemyUri(enemyImageUri: string) {
        return `${import.meta.env.BASE_URL}/${this.ENEMIES_BASE_URI}/${enemyImageUri}`;
    }

    public static getSkillUri(skillUri: string) {
        return `${import.meta.env.BASE_URL}/${this.SKILLS_BASE_URI}/${skillUri}`;
    }

    public static getItemUri(itemUri: string) {
        return `${import.meta.env.BASE_URL}/${this.ITEMS_BASE_URI}/${itemUri}`;
    }
}
