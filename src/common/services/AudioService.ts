import { Howl } from 'howler';
import { ToastService } from './ToastService.ts';

export abstract class AudioService {
    protected readonly tracks: { [key: string]: Howl } = {};
    protected abstract playingTrack: Howl | null;

    abstract loadTrack(name: string): void;

    protected play(name: string, fadeDuration = 1000) {
        if (this.playingTrack) {
            this.transition(fadeDuration);
        }
        const track = this.tracks[name];
        if (track) {
            track.volume(0);
            track.play();
            this.playingTrack = track;
            track.fade(0, 1, fadeDuration);
        } else {
            this.trackError(name);
        }
    }

    protected stopCurrent(fadeDuration = 1000) {
        if (this.playingTrack) {
            this.transition(fadeDuration);
        }
    }

    protected stop(name: string) {
        const track = this.tracks[name];
        if (track) {
            track.stop();
            this.playingTrack = null;
        } else {
            this.trackError(name);
        }
    }

    private transition(fadeDuration = 1000) {
        this.playingTrack?.fade(1, 0, fadeDuration);
        setTimeout(() => this.playingTrack?.stop(), fadeDuration);
    }

    private trackError(name: string) {
        ToastService.error({ message: `No track found with name "${name}"` });
    }
}
