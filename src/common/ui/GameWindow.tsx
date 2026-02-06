import { ReactNode } from 'react';
import style from './GameWindow.module.scss';

type GameWindowSize = 'sm' | 'md' | 'lg' | 'full';

type GameWindowProps = {
    title?: string;
    onClose?: () => void;
    children: ReactNode;
    className?: string;
    size?: GameWindowSize;
};

export const GameWindow = ({
    title,
    onClose,
    children,
    className = '',
    size = 'lg',
}: GameWindowProps) => {
    return (
        <div className={`${style.gameWindow} ${style[size]} ${className}`}>
            {(title || onClose) && (
                <header className={style.header}>
                    {title && <h2 className={style.title}>{title}</h2>}
                    {onClose && (
                        <button onClick={onClose} className={style.closeBtn} aria-label="Close">
                            ✕
                        </button>
                    )}
                </header>
            )}
            <div className={style.content}>{children}</div>
        </div>
    );
};
