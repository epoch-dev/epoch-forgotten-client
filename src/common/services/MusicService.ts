import { AudioService, PlayingTrack } from './AudioService.ts';
import { Howl } from 'howler';
import { AssetsService } from './AssetsService.ts';

export class MusicService extends AudioService {
    private static instance: MusicService;
    currentPlaying: PlayingTrack | null = null;
    volume: number = 1;

    constructor() {
        super();
        this.stopAllTracks();
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

    public play(name: string, resume = true) {
        if (!(name in this.tracks)) {
            this.loadTrack(name);
        }
        this.playUniqueVoice(name, resume);
        if (this.muted) {
            this.mute();
        } else {
            this.unmute();
        }
        this.currentPlaying?.track.volume(this.volume);
    }

    public setVolume(value: number) {
        value /= 100;
        this.volume = value;
        this.currentPlaying?.track.volume(value);
    }

    public mainTheme() {
        this.play('menu-theme.ogg');
    }
}
