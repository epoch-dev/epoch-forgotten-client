import style from './TooltipComponent.module.scss';
import { ReactNode, useState, useId, MouseEvent, FocusEvent, KeyboardEvent } from 'react';

type TooltipConfig = {
    containerWidth?: string;
    width?: string;
    top?: string;
    left?: string;
    transform?: string;
};

type TooltipPosition = Pick<TooltipConfig, 'top' | 'left' | 'transform'>;

type TooltipComponentProps = {
    children: ReactNode;
    hint: ReactNode;
    config?: TooltipConfig;
};

const DEFAULT_CONFIG: TooltipConfig = {
    containerWidth: 'fit-content',
    width: '12rem',
    top: '110%',
    left: '50%',
    transform: 'translateX(-50%)',
};

export const TooltipComponent = ({ children, hint, config }: TooltipComponentProps) => {
    const [position, setPosition] = useState<TooltipPosition>();
    const [isVisible, setIsVisible] = useState(false);
    const tooltipId = useId();
    const cssConfig = { ...DEFAULT_CONFIG, ...config, ...position };

    const positionAt = (x: number, y: number) => {
        const translateX = x > window.innerWidth / 2 ? '-110%' : '10%';
        const translateY = y > window.innerHeight / 2 ? '-110%' : '10%';

        setPosition({
            top: `${y}px`,
            left: `${x}px`,
            transform: `translateX(${translateX}) translateY(${translateY})`,
        });
    };

    const handleMouseEnter = () => {
        setIsVisible(true);
    };

    const handleMouseMove = ({ clientX, clientY }: MouseEvent) => {
        positionAt(clientX, clientY);
    };

    const handleMouseLeave = () => {
        setIsVisible(false);
    };

    const handleFocus = ({ target }: FocusEvent<HTMLDivElement>) => {
        const { left, top, bottom, width, height } = target.getBoundingClientRect();
        const isInUpperHalf = top + height / 2 < window.innerHeight / 2;

        target.setAttribute('aria-describedby', tooltipId);
        positionAt(left + width / 2, isInUpperHalf ? bottom : top);
        setIsVisible(true);
    };

    const handleBlur = ({ target }: FocusEvent<HTMLDivElement>) => {
        target.removeAttribute('aria-describedby');
        setIsVisible(false);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key !== 'Escape' || !isVisible) {
            return;
        }
        event.stopPropagation();
        setIsVisible(false);
    };

    return (
        <div
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={style.tooltipContainer}
            style={{ width: cssConfig.containerWidth }}>
            {children}
            {isVisible && (
                <div id={tooltipId} role="tooltip" className={style.tooltipWrapper} style={cssConfig}>
                    {hint}
                </div>
            )}
        </div>
    );
};
