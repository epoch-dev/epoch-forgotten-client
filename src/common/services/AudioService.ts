import { Howl } from 'howler';
import { ToastService } from './ToastService.ts';

export type PlayingTrack = {
    name: string;
    track: Howl;
};

export abstract class AudioService {
    private readonly transitionFadeDuration = 1000;
    private readonly fadeInDuration = 3000;
    private isTransitioning = false;

    protected readonly tracks: { [key: string]: Howl } = {};
    protected abstract currentPlaying: PlayingTrack | null;
    protected volume: number = 1;
    protected muted: boolean = false;

    protected abstract loadTrack(name: string): void;

    protected playAnyVoice(name: string) {
        const track = this.tracks[name];
        if (!track) {
            this.trackError(name);
            return;
        }
        track.play();
    }

    protected playUniqueVoice(name: string, resume: boolean) {
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
        if (this.isTransitioning) {
            setTimeout(() => {
                if (this.currentPlaying?.name !== name) {
                    this.currentPlaying?.track.play();
                }
            }, this.transitionFadeDuration);
        }
        if (this.currentPlaying) {
            track.once('play', () => {
                track.fade(0, this.volume, this.fadeInDuration);
            });
        }
        if (!resume) {
            track.seek(0);
        }
        track.play();
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
        this.isTransitioning = true;
        const currentTrack = this.currentPlaying?.track;
        currentTrack?.fade(this.volume, 0, this.transitionFadeDuration);
        setTimeout(() => {
            currentTrack?.pause();
            this.isTransitioning = false;
        }, this.transitionFadeDuration);
    }

    private trackError(name: string) {
        ToastService.error({ message: `No track found with name "${name}"` });
    }

    protected stopAllTracks() {
        Howler.stop();
    }

    public mute() {
        this.muted = true;
        this.currentPlaying?.track.mute(true);
    }

    public unmute() {
        this.muted = false;
        this.currentPlaying?.track.mute(false);
    }
}
