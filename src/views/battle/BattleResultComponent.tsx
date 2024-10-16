import style from './BattleResultComponent.module.scss';
import {
    BattleDefeatResults,
    BattleVictoryRewards,
    BattleVictoryRewardsLevel,
} from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { AssetsService } from '../../common/services/AssetsService';
import { ProgressBarComponent } from '../../common/components/ProgressBarComponent';
import { useEffect, useState } from 'react';
import { getLevelExperience, wait } from '../../common/utils';
import { CSS_COLOR } from '../../common/styles';
import { ScenesService } from '../scenes/ScenesService';
import { EffectsService } from '../../common/services/EffectsService';

export const BattleResultComponent = ({
    victoryResults,
    defeatResults,
}: {
    victoryResults: BattleVictoryRewards | undefined;
    defeatResults: BattleDefeatResults | undefined;
}) => {
    const { scene, setView } = useGameStore();

    useEffect(() => {
        void handleBattleEnded();
    }, [victoryResults]);

    const handleBattleEnded = async () => {
        await EffectsService.showEffects([
            ...(victoryResults?.effects ?? []),
            ...(defeatResults?.effects ?? []),
        ]);
        await ScenesService.initialize();
        await scene?.loadScene();
    };

    if (!victoryResults) {
        return (
            <section className={`${style.battleResultsWrapper} ${style.defeat}`}>
                <h1 className="title light">Defeat</h1>
                <p>
                    Darkness surrounds you as gentle hands lift you from the battlefield, guiding you to
                    safety...
                </p>
                <br />
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
                    {victoryResults.levels.map((levelInfo) => (
                        <CharacterLevelComponent
                            key={levelInfo.characterName}
                            levelInfo={levelInfo}
                            expGain={victoryResults.exp}
                        />
                    ))}
                </div>
                <div className={style.lootsWrapper}>
                    <p className="subtitle" style={{ marginTop: '1rem' }}>
                        Obtained:
                    </p>
                    <p style={{ marginTop: '0.5rem' }}>
                        <b className="epic">{victoryResults.gold}</b> Gold
                    </p>
                    <p>
                        <b className="epic">{victoryResults.exp}</b> Experience
                    </p>
                    {victoryResults.items.length > 0 && (
                        <div className={style.itemsWrapper}>
                            <b>Loots:</b>
                            {victoryResults?.items.map((item) => (
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
    const [exp, setExp] = useState(levelInfo.oldExp);
    const [nextLevelExp, setNextLevelExp] = useState(getLevelExperience(levelInfo.oldLevel + 1));

    useEffect(() => {
        if (level < levelInfo.oldLevel + levelInfo.gainedLevels) {
            void handleLevelUp();
        } else if (levelInfo.gainedLevels === 0) {
            void handleExpUp();
        }
    }, [level]);

    const handleLevelUp = async () => {
        await wait(250);
        setExp(nextLevelExp);
        await wait(900);
        let newLevel = level;
        setLevel((prevLevel) => {
            newLevel = prevLevel + 1;
            setNextLevelExp(getLevelExperience(newLevel + 1) - getLevelExperience(newLevel));
            setExp(0);
            return Math.min(newLevel, levelInfo.oldLevel + levelInfo.gainedLevels);
        });
        await wait(400);
        setExp(() => {
            return levelInfo.oldExp + expGain - getLevelExperience(newLevel - 1);
        });
        await wait(250);
    };

    const handleExpUp = async () => {
        await wait(500);
        const exp =
            levelInfo.oldLevel > 1
                ? levelInfo.oldExp + expGain - getLevelExperience(levelInfo.oldLevel)
                : levelInfo.oldExp + expGain;
        setExp(exp);
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
