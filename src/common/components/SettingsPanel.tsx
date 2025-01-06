import style from './SettingsPanel.module.scss';
import { useEffect, useState } from 'react';
import { MusicService } from '../services/MusicService';
import { SoundService } from '../services/SoundService';
import { AssetsService } from '../services/AssetsService';
import { signout } from '../utils';
import { appConfig } from '../config';
import { useSettingsStore } from '../state/SettingsStore';

const SettingsPanel = () => {
    const musicService = MusicService.getInstance();
    const soundService = SoundService.getInstance();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const {
        musicVolume,
        soundVolume,
        isMusicMuted,
        isSoundMuted,
        setMusicVolume,
        setSoundVolume,
        setIsMusicMuted,
        setIsSoundMuted,
    } = useSettingsStore();

    useEffect(() => {
        musicService.setVolume(musicVolume);
        if (isMusicMuted) {
            musicService.mute();
        }
        soundService.setVolume(musicVolume);
        if (isSoundMuted) {
            soundService.mute();
        }
    }, []);

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    const toggleMusicMute = () => {
        if (isMusicMuted) {
            setIsMusicMuted(false);
            musicService.unmute();
        } else {
            setIsMusicMuted(true);
            musicService.mute();
        }
    };

    const toggleSoundMute = () => {
        if (isSoundMuted) {
            setIsSoundMuted(false);
            soundService.unmute();
        } else {
            setIsSoundMuted(true);
            soundService.mute();
        }
    };

    const handleMusicVolumeChange = (volume: number) => {
        setMusicVolume(volume);
        musicService.setVolume(volume);
        if (volume > 0) {
            setIsMusicMuted(false);
            musicService.unmute();
        }
    };

    const handleSoundVolumeChange = (volume: number) => {
        setSoundVolume(volume);
        soundService.setVolume(volume);
        if (volume > 0) {
            setIsSoundMuted(false);
            soundService.unmute();
        }
    };

    return (
        <>
            <button className="panelBtn" onClick={togglePanel}>
                Settings
            </button>
            {isPanelOpen && (
                <div className={style.controlPanel}>
                    <h2 className="subtitle left primary">Settings</h2>
                    <hr />
                    <div className={style.volumeControl}>
                        <p>Music</p>
                        <input
                            type="range"
                            id="musicVolume"
                            min={0}
                            max={100}
                            value={100 * musicVolume}
                            onChange={(e) => handleMusicVolumeChange(+e.target.value / 100)}
                        />
                        {isMusicMuted ? (
                            <div onClick={toggleMusicMute} className={style.iconBtn}>
                                <img src={AssetsService.getIcon('MUTE')} />
                            </div>
                        ) : (
                            <div onClick={toggleMusicMute} className={style.iconBtn}>
                                <img src={AssetsService.getIcon('UNMUTE')} />
                            </div>
                        )}
                    </div>
                    <div className={style.volumeControl}>
                        <p>Sound</p>
                        <input
                            type="range"
                            id="soundVolume"
                            min={0}
                            max={100}
                            value={100 * soundVolume}
                            onChange={(e) => handleSoundVolumeChange(+e.target.value / 100)}
                        />
                        {isSoundMuted ? (
                            <div onClick={toggleSoundMute} className={style.iconBtn}>
                                <img src={AssetsService.getIcon('MUTE')} />
                            </div>
                        ) : (
                            <div onClick={toggleSoundMute} className={style.iconBtn}>
                                <img src={AssetsService.getIcon('UNMUTE')} />
                            </div>
                        )}
                    </div>
                    <hr />
                    <div
                        onClick={() =>
                            window.open(appConfig.reportIssueLink, '_blank', 'noopener,noreferrer')
                        }
                        className={style.settingsBtn}>
                        Report issue
                    </div>
                    <div onClick={signout} className={style.settingsBtn}>
                        Signout
                    </div>
                </div>
            )}
        </>
    );
};

export default SettingsPanel;
