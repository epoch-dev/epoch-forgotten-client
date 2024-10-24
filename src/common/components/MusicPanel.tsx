import { ChangeEvent, useState } from 'react';
import style from './MusicPanel.module.scss';
import { MusicService } from '../services/MusicService';

const MusicPanel = () => {
    const musicService = MusicService.getInstance();
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(100);

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    const toggleMute = () => {
        setIsMuted(prevIsMuted => {
            const newIsMuted = !prevIsMuted;
            if (newIsMuted) {
                musicService.mute();
            } else {
                musicService.unmute();
            }
            return newIsMuted;
        });
    };

    const handleVolumeChange = (e: ChangeEvent<HTMLInputElement>) => {
        setVolume(parseInt(e.target.value));
        musicService.setVolume(parseInt(e.target.value));
    };

    const styleMuted = isMuted ? style.muted : '';

    return (
        <>
            <button className='panelBtn' onClick={togglePanel}>
                Music Controls
            </button>
            {isPanelOpen && (
                <div className={style.musicPanel}>
                    <div className={style.controlPanel}>
                        <button
                            className={`${style.muteButton} ${styleMuted}`}
                            onClick={toggleMute}
                        >
                            Mute
                        </button>
                        <div className={style.volumeControl}>
                            <input
                                type='range'
                                id='volume'
                                min={0}
                                max={100}
                                value={volume}
                                onChange={handleVolumeChange}
                            />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MusicPanel;
