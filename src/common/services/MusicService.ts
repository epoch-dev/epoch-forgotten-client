import { AudioService, PlayingTrack } from './AudioService.ts';
import { Howl } from 'howler';
import { AssetsService } from './AssetsService.ts';

export class MusicService extends AudioService {
    private static instance: MusicService;
    currentPlaying: PlayingTrack | null = null;

    constructor() {
        super();
        this.stopAllTracks();
        this.loadTrack('battle.wav');
    }

    protected loadTrack(name: string) {
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

    public play(name: string) {
        if (!(name in this.tracks))
            this.loadTrack(name);
        this.playUniqueVoice(name);
    }

    public startBattleMusic() {
        this.playUniqueVoice('battle.wav');
    }
}
