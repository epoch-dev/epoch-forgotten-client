import { CssColor } from '../styles';
import styles from './ProgressBarComponent.module.scss';

type ProgressBarProps = {
    current: number;
    max: number;
    fillColor: CssColor;
    style?: {
        width?: string;
        height?: string;
        transitionTime?: number;
    };
};

export const ProgressBarComponent = ({ current, max, fillColor, style }: ProgressBarProps) => {
    const percentage = (current / max) * 100;

    return (
        <div className={styles.progressBar} style={{ width: style?.width, height: style?.height }}>
            <div
                className={styles.progressFill}
                style={{
                    width: `${percentage}%`,
                    backgroundColor: fillColor,
                    transition: `width ${style?.transitionTime ?? '0.3'}s ease-in-out`,
                }}></div>
        </div>
    );
};
