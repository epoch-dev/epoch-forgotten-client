export const getLevelExperience = (level: number) => {
    switch (level) {
        case 0:
        case 1:
            return 0;
        case 2:
            return 0 + 5;
        case 3:
            return 5 + 12; // ~2 mobs
        case 4:
            return 17 + 20;
        case 5:
            return 37 + 35;
        case 6:
            return 72 + 60; // ~5 mobs
        case 7:
            return 132 + 80;
        case 8:
            return 212 + 100;
        case 9:
            return 312 + 150; // ~8 mobs
        case 10:
            return 462 + 180;
        case 11:
            return 642 + 220;
        case 12:
            return 862 + 300; // ~12 mobs
        case 13:
            return 1162 + 340;
        case 14:
            return 1502 + 390;
        case 15:
            return 1892 + 500; // ~18 mobs
        case 16:
            return 2392 + 600;
        case 17:
            return 2992 + 700;
        case 18:
            return 3692 + 900; // ~23 mobs
        case 19:
            return 4592 + 1100;
        case 20:
            return 5692 + 1308;
        case 21:
            return 7000 + 1600; // ~33 mobs
        case 22:
            return 8600 + 1900;
        case 23:
            return 10_500 + 2300;
        case 24:
            return 12_800 + 2800; // ~47 mobs
        case 25:
            return 15_600 + 3000;
        case 26:
            return 18_600 + 3200;
        case 27:
            return 21_800 + 3500; // ~58 mobs
        case 28:
            return 25_300 + 3750;
        case 29:
            return 29_050 + 4050;
        case 30:
            return 33_1000 + 4400; // ~64 mobs

        default:
            return 1_000_000_000;
    }
};
