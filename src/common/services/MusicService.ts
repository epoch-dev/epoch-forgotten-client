import { AudioService } from './AudioService.ts';
import { Howl } from 'howler';
import { AssetsService } from './AssetsService.ts';

export class MusicService extends AudioService {
    private static instance: MusicService;
    playingTrack: Howl | null = null;

    constructor() {
        super();
        this.loadTrack('battle');
        this.loadTrack('village');
    }

    loadTrack(name: string) {
        this.tracks[name] = new Howl({
            src: AssetsService.getMusicUri(name),
            loop: true,
        });
    }

    public static getInstance(): MusicService {
        if (!MusicService.instance) {
            MusicService.instance = new MusicService();
        }
        return MusicService.instance;
    }

    public startBattleMusic() {
        this.play('battle');
    }

    public startVillageMusic() {
        this.play('village');
    }

}
