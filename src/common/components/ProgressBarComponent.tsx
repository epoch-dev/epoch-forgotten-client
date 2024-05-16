import styles from './ProgressBarComponent.module.scss';

export const ProgressBarComponent = ({ current, max }: { current: number; max: number }) => {
    const percentage = (current / max) * 100;

    return (
        <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${percentage}%` }}></div>
        </div>
    );
};
