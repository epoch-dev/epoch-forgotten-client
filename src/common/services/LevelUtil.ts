export const getLevelExperience = (level: number) => {
    // exp from 1 mob ~ 5 * (10 + enemy level)
    switch (level) {
        case 0:
        case 1:
            return 0;
        case 2:
            return 0 + 50;
        case 3:
            return 50 + 100; // ~2 mobs
        case 4:
            return 150 + 150;
        case 5:
            return 300 + 200;
        case 6:
            return 500 + 300; // ~4 mobs
        case 7:
            return 800 + 400;
        case 8:
            return 1200 + 500;
        case 9:
            return 1700 + 600; // ~7 mobs
        case 10:
            return 2300 + 700;
        case 11:
            return 3000 + 800;
        case 12:
            return 3800 + 900; // ~9 mobs
        case 13:
            return 4700 + 1100;
        case 14:
            return 5800 + 1300;
        case 15:
            return 7100 + 1500; // ~12 mobs
        case 16:
            return 8600 + 1800;
        case 17:
            return 10_400 + 2200;
        case 18:
            return 12_600 + 2700; // ~20 mobs
        case 19:
            return 15_300 + 3300;
        case 20:
            return 18_600 + 3600;
        case 21:
            return 22_200 + 4000; // ~26 mobs
        case 22:
            return 26_200 + 4400;
        case 23:
            return 30_600 + 4800;
        case 24:
            return 35_400 + 5200; // ~31 mobs
        case 25:
            return 40_600 + 5500;
        case 26:
            return 46_100 + 5900;
        case 27:
            return 52_000 + 6400; // ~34 mobs
        case 28:
            return 58_400 + 6900;
        case 29:
            return 65_300 + 7600;
        case 30:
            return 72_900 + 8000; // ~40 mobs

        default:
            return 1_000_000_000;
    }
};
