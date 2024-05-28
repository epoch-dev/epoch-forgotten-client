import { CssColor } from '../styles';
import styles from './ProgressBarComponent.module.scss';

export const ProgressBarComponent = ({
    current,
    max,
    fillColor,
}: {
    current: number;
    max: number;
    fillColor: CssColor;
}) => {
    const percentage = (current / max) * 100;

    return (
        <div className={styles.progressBar}>
            <div
                className={styles.progressFill}
                style={{ width: `${percentage}%`, backgroundColor: fillColor }}></div>
        </div>
    );
};
