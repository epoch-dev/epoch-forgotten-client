const ICONS = {
    user: 'user.png',
} as const;

type IconName = keyof typeof ICONS;

export class AssetsService {
    private static ICONS_BASE_URI = './images/icons';
    private static MAPS_BASE_URI = '/images/maps';

    public static getIcon(iconName: IconName) {
        return `${this.ICONS_BASE_URI}/${ICONS[iconName]}`;
    }

    public static getMapUri(mapName: string) {
        return `${this.MAPS_BASE_URI}/${mapName}`;
    }
}
