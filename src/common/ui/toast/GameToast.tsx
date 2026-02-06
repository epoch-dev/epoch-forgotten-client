import { useEffect, useState, useCallback } from 'react';
import style from './GameToast.module.scss';
import { ToastData, toastBus } from './ToastManager';

// Icons for different toast types
const ToastIcon = ({ type }: { type: ToastData['type'] }) => {
    switch (type) {
        case 'quest':
            return <span className={style.icon}>📜</span>;
        case 'item':
            return <span className={style.icon}>🎒</span>;
        case 'success':
            return <span className={style.icon}>✓</span>;
        case 'error':
            return <span className={style.icon}>!</span>;
        default:
            return <span className={style.icon}>ℹ</span>;
    }
};

const ToastItem = ({
    toast,
    onDismiss,
}: {
    toast: ToastData;
    onDismiss: (id: string) => void;
}) => {
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => onDismiss(toast.id), 300);
        }, toast.duration);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onDismiss]);

    const handleClick = () => {
        setIsExiting(true);
        setTimeout(() => onDismiss(toast.id), 300);
    };

    return (
        <div
            className={`${style.toastItem} ${style[toast.type]} ${isExiting ? style.exiting : ''}`}
            onClick={handleClick}>
            <ToastIcon type={toast.type} />
            <div className={style.toastContent}>
                <span className={style.title}>{toast.title}</span>
                {toast.message && <span className={style.message}>{toast.message}</span>}
            </div>
        </div>
    );
};

export const GameToastContainer = () => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const addToast = useCallback((toast: ToastData) => {
        setToasts((prev) => [...prev, toast]);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        const unsubAdd = toastBus.subscribe(addToast);
        const unsubDismiss = toastBus.subscribeDismiss(removeToast);

        return () => {
            unsubAdd();
            unsubDismiss();
        };
    }, [addToast, removeToast]);

    if (toasts.length === 0) return null;

    return (
        <div className={style.toastContainer}>
            {toasts.map((toast) => (
                <ToastItem key={toast.id} toast={toast} onDismiss={removeToast} />
            ))}
        </div>
    );
};
