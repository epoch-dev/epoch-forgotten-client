import { ReactNode } from 'react';
import style from './GameGrid.module.scss';

type GameGridProps = {
    slotSize?: string;
    gap?: string;
    className?: string;
    children: ReactNode;
};

export const GameGrid = ({
    slotSize,
    gap,
    className = '',
    children,
}: GameGridProps) => {
    const gridStyle: React.CSSProperties & Record<string, string> = {};
    
    if (slotSize) {
        gridStyle['--slot-size'] = slotSize;
    }
    if (gap) {
        gridStyle.gap = gap;
    }

    return (
        <div className={`${style.gameGrid} ${className}`} style={gridStyle}>
            {children}
        </div>
    );
};
