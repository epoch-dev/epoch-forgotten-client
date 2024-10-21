import { CssColor } from '../styles';
import styles from './ProgressBarComponent.module.scss';

type ProgressBarProps = {
    current: number;
    max: number;
    fillColor: CssColor;
    style?: {
        width: string;
        height: string;
    };
};

export const ProgressBarComponent = ({ current, max, fillColor, style }: ProgressBarProps) => {
    const percentage = (current / max) * 100;

    return (
        <div className={styles.progressBar} style={{ width: style?.width, height: style?.height }}>
            <div
                className={styles.progressFill}
                style={{ width: `${percentage}%`, backgroundColor: fillColor }}></div>
        </div>
    );
};
