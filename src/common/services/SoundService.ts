import { AudioService, PlayingTrack } from './AudioService.ts';
import { Howl } from 'howler';
import { AssetsService } from './AssetsService.ts';

export class SoundService extends AudioService {
    private static instance: SoundService;
    currentPlaying: PlayingTrack | null = null;

    constructor() {
        super();
        this.loadTrack('new-quest.wav');
        this.loadTrack('lvl-up');
    }

    protected loadTrack(name: string) {
        this.tracks[name] = new Howl({
            src: AssetsService.getSoundUri(name),
        });
    }

    public static getInstance(): SoundService {
        if (!SoundService.instance) {
            SoundService.instance = new SoundService();
        }
        return SoundService.instance;
    }

    public newQuest() {
        this.playAnyVoice('new-quest.wav');
    }

    public lvlUp() {
        this.playAnyVoice('lvl-up');
    }

}
