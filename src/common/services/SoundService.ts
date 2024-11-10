import { AudioService, PlayingTrack } from './AudioService.ts';
import { Howl } from 'howler';
import { AssetsService } from './AssetsService.ts';
import { ItemType } from '../api/.generated/api.ts';

export class SoundService extends AudioService {
    private static instance: SoundService;
    currentPlaying: PlayingTrack | null = null;

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

    public play(name: string) {
        if (!(name in this.tracks)) {
            this.loadTrack(name);
        }
        this.playAnyVoice(name);
    }

    public newQuest() {
        this.play('new-quest.ogg');
    }

    public click() {
        this.play('click.ogg');
    }

    public attrUp() {
        this.play('attr-up.ogg');
    }

    public newSkill() {
        this.play('new-skill.ogg');
    }

    public toggleParty() {
        this.play('party-toggle.mp3');
    }

    public equip(itemType?: ItemType) {
        if (itemType === 'Charm') {
            this.play('equip-charm.ogg');
        } else {
            this.play('equip.ogg');
        }
    }

    public unequip() {
        this.play('unequip.ogg');
    }

    public victory() {
        this.play('victory.ogg');
    }

    public defeat() {
        this.play('defeat.ogg');
    }

    public pay() {
        this.play('pay.ogg');
    }
}
