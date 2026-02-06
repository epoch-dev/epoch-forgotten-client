import { ReactNode, ButtonHTMLAttributes } from 'react';
import style from './GameButton.module.scss';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

type GameButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    children: ReactNode;
};

export const GameButton = ({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    disabled,
    ...props
}: GameButtonProps) => {
    return (
        <button
            className={`${style.gameButton} ${style[variant]} ${style[size]} ${className}`}
            disabled={disabled}
            {...props}>
            {children}
        </button>
    );
};
