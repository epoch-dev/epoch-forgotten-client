import style from './BattleResultComponent.module.scss';
import { BattleVictoryRewards } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';

export const BattleResultComponent = ({
    victory,
    defeat,
}: {
    victory: BattleVictoryRewards | undefined;
    defeat: boolean;
}) => {
    const { setView } = useGameStore();

    if (!victory && !defeat) {
        return <></>;
    }

    if (!victory) {
        return (
            <section className={`${style.battleResultsWrapper} ${style.defeat}`}>
                <h1 className="title light">Defeat</h1>
                <hr />
                <div onClick={() => setView(GameView.World)} className={style.closeBtn}>
                    Close
                </div>
            </section>
        );
    }

    return (
        <section className={`${style.battleResultsWrapper} ${style.victory}`}>
            <h1 className="title light">Victory</h1>
            <hr />
            <p style={{ marginTop: '1rem' }}>Gold: {victory.gold}</p>
            <p>Exp: {victory.exp}</p>
            {victory.items.length > 0 && (
                <div className={style.itemsWrapper}>
                    <b>Loots:</b>
                    {victory?.items.map((item) => (
                        <p key={item.id}>{item.label}</p>
                    ))}
                </div>
            )}
            <div onClick={() => setView(GameView.World)} className={style.closeBtn}>
                Close
            </div>
        </section>
    );
};
