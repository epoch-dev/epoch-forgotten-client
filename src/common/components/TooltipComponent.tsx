import style from './TooltipComponent.module.scss';
import { ReactNode, useState, MouseEvent } from 'react';
import { createPortal } from 'react-dom';

type TooltipComponentProps = {
    children: ReactNode;
    hint: ReactNode;
    config?: {
        containerWidth?: string;
        width?: string;
    };
};

const OFFSET = 12;

export const TooltipComponent = ({ children, hint, config }: TooltipComponentProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });

    const handleMouseEnter = () => {
        setIsVisible(true);
    };

    const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
        const flipX = clientX > window.innerWidth - 250;
        const flipY = clientY > window.innerHeight - 200;

        setPosition({
            top: flipY ? clientY - OFFSET : clientY + OFFSET,
            left: flipX ? clientX - OFFSET : clientX + OFFSET,
        });
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    const flipX = position.left > window.innerWidth - 250;
    const flipY = position.top > window.innerHeight - 200;

    const tooltip = isVisible ? (
        <div
            className={style.tooltipWrapper}
            style={{
                width: config?.width ?? '14rem',
                top: position.top,
                left: position.left,
                transform: `${flipX ? 'translateX(-100%)' : ''} ${flipY ? 'translateY(-100%)' : ''}`.trim() || undefined,
            }}>
            {hint}
        </div>
    ) : null;

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            className={style.tooltipContainer}
            style={{ width: config?.containerWidth ?? 'fit-content' }}>
            {children}
            {/* Portal renders tooltip at document root, outside any transformed ancestor */}
            {createPortal(tooltip, document.body)}
        </div>
    );
};
