import { useEffect } from 'react';
import { ToastService } from './services/ToastService';

export const useYellowToast = () => {
    useEffect(() => {
        let timeoutId: number;

        const showToast = () => {
            ToastService.yellow();
        };

        const scheduleToast = () => {
            const now = new Date();

            const targetTime = new Date();
            targetTime.setHours(21, 36, 0, 0);

            if (now >= targetTime) {
                targetTime.setDate(targetTime.getDate() + 1);
            }

            const timeDifference = targetTime.getTime() - now.getTime();

            timeoutId = setTimeout(() => {
                showToast();
                scheduleToast();
            }, timeDifference);
        };

        scheduleToast();

        return () => {
            clearTimeout(timeoutId);
        };
    }, []);
};
