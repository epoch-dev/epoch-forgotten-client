import { Howl } from 'howler';
import { ToastService } from './ToastService.ts';

export type PlayingTrack = {
    name: string;
    track: Howl;
};

export abstract class AudioService {
    protected readonly tracks: { [key: string]: Howl } = {};
    protected abstract currentPlaying: PlayingTrack | null;

    protected abstract loadTrack(name: string): void;

    protected playAnyVoice(name: string) {
        const track = this.tracks[name];
        if (!track) {
            this.trackError(name);
            return;
        }
        track.play();
    }

    protected playUniqueVoice(name: string, fadeDuration = 1000) {
        if (this.currentPlaying?.name === name) {
            return;
        }
        if (this.currentPlaying) {
            this.transition(fadeDuration);
        }
        const track = this.tracks[name];
        if (!track) {
            this.trackError(name);
            return;
        }
        track.play();
        if (this.currentPlaying) {
            track.volume(0);
            track.fade(0, 1, fadeDuration);
        }
        this.currentPlaying = { name, track };
    }

    protected stopCurrent(fadeDuration = 1000) {
        if (this.currentPlaying) {
            this.transition(fadeDuration);
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

    private transition(fadeDuration = 3000) {
        const currentTrack = this.currentPlaying?.track;
        currentTrack?.fade(1, 0, fadeDuration);
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
