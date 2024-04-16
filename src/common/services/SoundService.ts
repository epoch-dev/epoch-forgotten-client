import { AudioService } from './AudioService.ts';
import { Howl } from 'howler';
import { AssetsService } from './AssetsService.ts';

export class SoundService extends AudioService {
    private static instance: SoundService;
    playingTrack: Howl | null = null;

    constructor() {
        super();
        this.loadTrack('new-quest');
        this.loadTrack('lvl-up');
    }

    loadTrack(name: string) {
        this.tracks[name] = new Howl({
            src: AssetsService.getSoundUri(name),
            loop: true,
        });
    }

    public static getInstance(): SoundService {
        if (!SoundService.instance) {
            SoundService.instance = new SoundService();
        }
        return SoundService.instance;
    }

    public newQuest() {
        this.play('new-quest');
    }

    public lvlUp() {
        this.play('lvl-up');
    }

}
