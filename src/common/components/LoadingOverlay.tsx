import style from './LoadingOverlay.module.scss';

const LoadingOverlay = () => (
    <div className={style['loading-screen']}>
        <div className={style['loading-spinner']}></div>
    </div>
);

export default LoadingOverlay;
