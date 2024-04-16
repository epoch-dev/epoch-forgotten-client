import { useEffect, useState } from "react";
import style from './MuteButton.module.scss'
import { MusicService } from "../services/MusicService";

const MuteButton = () => { // todo: replace MUTE string with an icon
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        const musicService = MusicService.getInstance();
        if (isMuted) {
            musicService.mute();
        } else {
            musicService.unmute();
        }
    }, [isMuted])

    return (
        <button
            className={`${style.muteButton} ${isMuted ? style.muted : ''}`}
            onClick={() => setIsMuted(prevState => !prevState)}
        >
            MUTE
        </button>
    )
}

export default MuteButton;
