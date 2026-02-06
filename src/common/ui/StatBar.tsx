import style from './StatBar.module.scss';

type StatBarType = 'health' | 'mana' | 'exp';

type StatBarProps = {
    current: number;
    max: number;
    type?: StatBarType;
    showLabel?: boolean;
    className?: string;
};

export const StatBar = ({
    current,
    max,
    type = 'health',
    showLabel = false,
    className = '',
}: StatBarProps) => {
    const percentage = Math.max(0, Math.min(100, (current / max) * 100));

    return (
        <div className={`${style.statBar} ${className}`}>
            <div className={style.track}>
                <div
                    className={`${style.fill} ${style[type]}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
            {showLabel && (
                <span className={style.label}>
                    {Math.round(current)} / {Math.round(max)}
                </span>
            )}
        </div>
    );
};
