import { useEffect, useState } from 'react';
import { appConfig, AppProfiles } from '../config';
import style from './FpsCounter.module.scss';

type FpsCounterProps = {
    getActualFps: () => number;
};

const isDev = appConfig.profile === AppProfiles.Dev;

export const FpsCounter = ({ getActualFps }: FpsCounterProps) => {
    const [fps, setFps] = useState(0);

    useEffect(() => {
        if (!isDev) return;

        const interval = setInterval(() => {
            setFps(Math.round(getActualFps()));
        }, 500);

        return () => clearInterval(interval);
    }, [getActualFps]);

    if (!isDev || fps === 0) return null;

    return <div className={style.fpsCounter}>{fps} FPS</div>;
};
