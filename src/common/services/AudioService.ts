import { Howl } from 'howler';
import { ToastService } from './ToastService.ts';

export type PlayingTrack = {
    name: string;
    track: Howl;
};

export abstract class AudioService {
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
            track.fade(0, this.volume, 5000);
        }
        this.currentPlaying = { name, track };
    }

    public stopCurrent(fadeDuration = 1000) {
        if (this.currentPlaying) {
            this.transition(fadeDuration);
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

    private transition(fadeDuration = 2000) {
        const currentTrack = this.currentPlaying?.track;
        currentTrack?.fade(this.volume, 0, fadeDuration);
        setTimeout(() => currentTrack?.stop(), fadeDuration);
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
