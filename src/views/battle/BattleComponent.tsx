import style from './BattleComponent.module.scss';
import { useEffect, useState } from 'react';
import { useGameStore } from '../game/GameStore';
import { CharacterDto } from '../../common/api/.generated';
import { CharactersClient } from '../../common/api/client';
import { GameView } from '../game/types';

export const BattleComponent = () => {
    // temp state - before battle data is available
    const [party, setParty] = useState<CharacterDto[]>([]);
    const { encounter, setView } = useGameStore();

    useEffect(() => {
        void getParty();
    }, []);

    const getParty = async () => {
        const partyData = await CharactersClient.getParty();
        setParty(partyData.data);
    };

    const handleRun = () => {
        setView(GameView.World);
    };

    return (
        <section className={style.battleWrapper}>
            <div className={style.fieldWrapper}>
                <div className={style.alliesWrapper}>
                    {party.map((ally) => (
                        <div key={ally.id} className={style.characterItem}>
                            <p>{ally.name}</p>
                            <img
                                src={`images/characters/${ally.imageUri}`}
                                alt={ally.name}
                            />
                        </div>
                    ))}
                </div>
                <div className={style.enemiesWrapper}>
                    {encounter?.enemies.map((enemy, enemyIndex) => (
                        <div key={enemyIndex} className={style.characterItem}>
                            <p>{enemy.label}</p>
                            <img src={`images/enemies/${enemy.imageUri}`} alt={enemy.label} />
                        </div>
                    ))}
                </div>
            </div>
            <div className={style.actionsWrapper}>
                <div className={style.movesWrapper}>
                    <button className={style.moveItem}>Fire Slash</button>
                    <button className={style.moveItem}>With Thrust</button>
                    <button className={style.moveItem}>Water Bash</button>
                    <button className={style.moveItem}>Dark Pulse</button>
                </div>
                <div className={style.controlsWrapper}>
                    <button className={style.controlItem}>Attack</button>
                    <button onClick={handleRun} className={style.controlItem}>
                        Run
                    </button>
                </div>
            </div>
        </section>
    );
};
