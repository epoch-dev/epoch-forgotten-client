import { ReactNode } from 'react';
import style from './GameGrid.module.scss';
import { TooltipComponent } from '../components/TooltipComponent';

type ItemRarity = 'common' | 'uncommon' | 'rare' | 'unique' | 'epic' | 'mythical';

type GameSlotProps = {
    isEmpty?: boolean;
    rarity?: ItemRarity;
    onClick?: () => void;
    tooltipContent?: ReactNode;
    className?: string;
    children?: ReactNode;
};

export const GameSlot = ({
    isEmpty = false,
    rarity,
    onClick,
    tooltipContent,
    className = '',
    children,
}: GameSlotProps) => {
    const slotContent = (
        <div
            className={`${style.gameSlot} ${isEmpty ? style.empty : ''} ${rarity ? style[rarity] : ''} ${onClick ? style.clickable : ''} ${className}`}
            onClick={onClick}>
            {children}
        </div>
    );

    if (tooltipContent && !isEmpty) {
        return <TooltipComponent hint={tooltipContent}>{slotContent}</TooltipComponent>;
    }

    return slotContent;
};
