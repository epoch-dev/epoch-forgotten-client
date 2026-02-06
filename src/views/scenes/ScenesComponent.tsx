import { FpsCounter } from '../../common/components/FpsCounter';
import { GameView } from '../game/types';
import { useSceneConnection } from './useSceneConnection';
import style from './ScenesComponent.module.scss';

export const ScenesComponent = () => {
    const { view, getActualFps } = useSceneConnection();

    const sceneClass = (() => {
        switch (view) {
            case GameView.Dialogue:
            case GameView.ShopBuy:
            case GameView.ShopSell:
                return style.blur;
            case GameView.World:
                return '';
            default:
                return style.gone;
        }
    })();

    return (
        <section className={style.sceneContainer}>
            <div id="sceneWrapper" className={`${style.sceneWrapper} ${sceneClass}`} />
            <div className={style.vignette} />
            <FpsCounter getActualFps={getActualFps} />
        </section>
    );
};
