import { Howl } from 'howler';
import { ToastService } from './ToastService.ts';

export type PlayingTrack = {
    name: string;
    track: Howl;
};

export abstract class AudioService {
    private readonly transitionFadeDuration = 2000;
    private readonly fadeInDuration = 5000;

    protected readonly tracks: { [key: string]: Howl } = {};
    protected abstract currentPlaying: PlayingTrack | null;
    protected volume: number = 1;

    protected abstract loadTrack(name: string): void;

    protected playAnyVoice(name: string) {
        const track = this.tracks[name];
        if (!track) {
            this.trackError(name);
            return;
        }
        track.play();
    }

    protected playUniqueVoice(name: string) {
        if (this.currentPlaying?.name === name) {
            return;
        }
        if (this.currentPlaying) {
            this.transition();
        }
        const track = this.tracks[name];
        if (!track) {
            this.trackError(name);
            return;
        }
        track.play();
        if (this.currentPlaying) {
            track.volume(0);
            track.fade(0, this.volume, this.fadeInDuration);
        }
        this.currentPlaying = { name, track };
    }

    public stopCurrent() {
        if (this.currentPlaying) {
            this.transition();
            this.currentPlaying = null;
        }
    }

    protected stop(name: string) {
        const track = this.tracks[name];
        if (track) {
            track.stop();
            this.currentPlaying = null;
        } else {
            this.trackError(name);
        }
    }

    private transition() {
        const currentTrack = this.currentPlaying?.track;
        currentTrack?.fade(this.volume, 0, this.transitionFadeDuration);
        setTimeout(() => currentTrack?.stop(), this.transitionFadeDuration);
    }

    private trackError(name: string) {
        ToastService.error({ message: `No track found with name "${name}"` });
    }

    protected stopAllTracks() {
        Howler.stop();
    }

    public mute() {
        this.currentPlaying?.track.mute(true);
    }

    public unmute() {
        this.currentPlaying?.track.mute(false);
    }
}
