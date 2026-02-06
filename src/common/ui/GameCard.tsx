import { ReactNode } from 'react';
import style from './GameCard.module.scss';

type GameCardProps = {
    title?: string;
    image?: string;
    imageAlt?: string;
    onClick?: () => void;
    selected?: boolean;
    className?: string;
    children?: ReactNode;
};

export const GameCard = ({
    title,
    image,
    imageAlt = '',
    onClick,
    selected = false,
    className = '',
    children,
}: GameCardProps) => {
    return (
        <div
            className={`${style.gameCard} ${selected ? style.selected : ''} ${onClick ? style.clickable : ''} ${className}`}
            onClick={onClick}>
            {image && (
                <div className={style.imageWrapper}>
                    <img src={image} alt={imageAlt} draggable={false} />
                </div>
            )}
            {title && <h3 className={style.title}>{title}</h3>}
            {children && <div className={style.content}>{children}</div>}
        </div>
    );
};
