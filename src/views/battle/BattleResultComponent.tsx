import style from './BattleResultComponent.module.scss';
import { BattleVictoryRewards, BattleVictoryRewardsLevel } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { AssetsService } from '../../common/services/AssetsService';
import { ProgressBarComponent } from '../../common/components/ProgressBarComponent';
import { useEffect, useState } from 'react';
import { getLevelExperience, wait } from '../../common/utils';
import { CSS_COLOR } from '../../common/styles';

export const BattleResultComponent = ({ victory }: { victory: BattleVictoryRewards | undefined }) => {
    const { setView } = useGameStore();

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
            <div className={style.resultsWrapper}>
                <div className={style.partyWrapper}>
                    {victory.levels.map((levelInfo) => (
                        <CharacterLevelComponent
                            key={levelInfo.characterName}
                            levelInfo={levelInfo}
                            expGain={victory.exp}
                        />
                    ))}
                </div>
                <div>
                    <p className="subtitle" style={{ marginTop: '1rem' }}>
                        Obtained:
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        <b className="epic">{victory.gold}</b> Gold
                    </p>
                    <p>
                        <b className="epic">{victory.exp}</b> Experience
                    </p>
                    {victory.items.length > 0 && (
                        <div className={style.itemsWrapper}>
                            <b>Loots:</b>
                            {victory?.items.map((item) => (
                                <p key={item.id}>{item.label}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div onClick={() => setView(GameView.World)} className={style.closeBtn}>
                Close
            </div>
        </section>
    );
};

const CharacterLevelComponent = ({
    levelInfo,
    expGain,
}: {
    levelInfo: BattleVictoryRewardsLevel;
    expGain: number;
}) => {
    const [level, setLevel] = useState(levelInfo.oldLevel);
    const [exp, setExp] = useState(levelInfo.oldExp - getLevelExperience(levelInfo.oldLevel));
    const [nextLevelExp, setNextLevelExp] = useState(
        getLevelExperience(levelInfo.oldLevel + 1) - getLevelExperience(levelInfo.oldLevel),
    );

    useEffect(() => {
        if (level < levelInfo.oldLevel + levelInfo.gainedLevels) {
            void handleLevelUp();
        }
    }, [level]);

    const handleLevelUp = async () => {
        setExp(nextLevelExp);
        await wait(750);
        setLevel((prevLevel) => {
            const newLevel = prevLevel + 1;
            setNextLevelExp(getLevelExperience(newLevel + 1) - getLevelExperience(newLevel));
            setExp(0);
            return Math.min(newLevel, levelInfo.oldLevel + levelInfo.gainedLevels);
        });
        await wait(250);
        setExp(() => {
            const currentLevel = level + 1;
            return levelInfo.oldExp + expGain - getLevelExperience(currentLevel);
        });
        await wait(150);
    };

    return (
        <div className={style.characterItem}>
            <img
                src={AssetsService.getCharacterUri(levelInfo.characterImageUri)}
                alt={levelInfo.characterName}
            />
            <div className={style.characterLevel}>
                <p>
                    {levelInfo.characterName} | {level}
                </p>
                <ProgressBarComponent current={exp} max={nextLevelExp} fillColor={CSS_COLOR.EPIC} />
            </div>
        </div>
    );
};
