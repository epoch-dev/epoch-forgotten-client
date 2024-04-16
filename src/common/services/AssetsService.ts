const ICONS = {
    user: 'user.png',
} as const;

type IconName = keyof typeof ICONS;

export class AssetsService {
    private static ICONS_BASE_URI = './images/icons';
    private static SCENES_BASE_URI = '/images/scenes';
    private static MUSIC_BASE_URI = '/audio/music';
    private static SOUNDS_BASE_URI = '/audio/sounds';

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
}
