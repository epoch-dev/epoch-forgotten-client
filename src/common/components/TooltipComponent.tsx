import style from './TooltipComponent.module.scss';
import {
    type FocusEvent,
    type KeyboardEvent,
    type ReactNode,
    useLayoutEffect,
    useRef,
    useState,
    useId,
} from 'react';

type TooltipConfig = {
    containerWidth?: string;
    width?: string;
};

type TooltipComponentProps = {
    children: ReactNode;
    hint: ReactNode;
    config?: TooltipConfig;
};

const DEFAULT_CONFIG: TooltipConfig = {
    containerWidth: 'fit-content',
    width: '12rem',
};

export const TooltipComponent = ({ children, hint, config }: TooltipComponentProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [position, setPosition] = useState({ left: 0, top: 0 });
    const triggerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const tooltipId = useId();
    const cssConfig = { ...DEFAULT_CONFIG, ...config };

    useLayoutEffect(() => {
        if (!isVisible) {
            return;
        }

        const updatePosition = () => {
            const trigger = triggerRef.current?.getBoundingClientRect();
            const tooltip = tooltipRef.current?.getBoundingClientRect();
            if (!trigger || !tooltip) {
                return;
            }

            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;
            const viewportPadding = 8;
            const minLeft = tooltip.width / 2 + viewportPadding;
            const maxLeft = viewportWidth - tooltip.width / 2 - viewportPadding;
            const preferredLeft = trigger.left + trigger.width / 2;
            const left = Math.max(minLeft, Math.min(preferredLeft, maxLeft));
            const belowTop = trigger.bottom + viewportPadding;
            const aboveTop = trigger.top - tooltip.height - viewportPadding;
            const top =
                belowTop + tooltip.height <= viewportHeight - viewportPadding
                    ? belowTop
                    : Math.max(viewportPadding, aboveTop);

            setPosition({ left, top });
        };

        updatePosition();
        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isVisible]);

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
            setIsVisible(false);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            setIsVisible(false);
        }
    };

    return (
        <div
            ref={triggerRef}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={style.tooltipContainer}
            style={{ width: cssConfig.containerWidth }}
            tabIndex={0}
            aria-describedby={isVisible ? tooltipId : undefined}>
            {children}
            {isVisible && (
                <div
                    ref={tooltipRef}
                    id={tooltipId}
                    className={style.tooltipWrapper}
                    role="tooltip"
                    style={{
                        width: cssConfig.width,
                        left: `${position.left}px`,
                        top: `${position.top}px`,
                    }}>
                    {hint}
                </div>
            )}
        </div>
    );
};
