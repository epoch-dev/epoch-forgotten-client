import style from './BattleResultComponent.module.scss';
import {
    BattleDefeatResults,
    BattleVictoryRewards,
    BattleVictoryRewardsLevel,
} from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { AssetsService } from '../../common/services/AssetsService';
import { useEffect, useState } from 'react';
import { wait } from '../../common/utils';
import { ScenesService } from '../scenes/ScenesService';
import { EffectsService } from '../../common/services/EffectsService';
import { getLevelExperience } from '../../common/api/definitions/levelUtil';
import { StatBar } from '../../common/ui';

type BattleResultProps = {
    victoryResults: BattleVictoryRewards | undefined;
    defeatResults: BattleDefeatResults | undefined;
};

export const BattleResultComponent = ({ victoryResults, defeatResults }: BattleResultProps) => {
    const { scene, setView } = useGameStore();

    useEffect(() => {
        void handleBattleEnded();
    }, [victoryResults]);

    const handleBattleEnded = async () => {
        await EffectsService.showEffects([
            ...(victoryResults?.effects ? [victoryResults.effects] : []),
            ...(defeatResults?.effects ? [defeatResults.effects] : []),
        ]);
        await ScenesService.initialize();
        await scene?.loadScene();
    };

    const handleClose = () => setView(GameView.World);

    if (!victoryResults) {
        return (
            <section className={`${style.battleResultsWrapper} ${style.defeat}`}>
                <h1>Defeat</h1>
                <hr />
                <p>
                    Darkness surrounds you as gentle hands lift you from the battlefield,
                    <br />
                    guiding you to safety...
                </p>
                <button onClick={handleClose} className={style.closeBtn}>
                    Continue
                </button>
            </section>
        );
    }

    return (
        <section className={`${style.battleResultsWrapper} ${style.victory}`}>
            <h1>Victory</h1>
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
                    <p className="subtitle">Rewards</p>
                    <p>
                        <b className="epic">{victoryResults.gold}</b> Gold
                    </p>
                    <p>
                        <b className="epic">{victoryResults.exp}</b> Experience
                    </p>
                    {victoryResults.items.length > 0 && (
                        <div className={style.itemsWrapper}>
                            <b>Loot:</b>
                            {victoryResults.items.map((item, idx) => (
                                <p key={`${idx}-${item.id}`}>{item.label}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <button onClick={handleClose} className={style.closeBtn}>
                Continue
            </button>
        </section>
    );
};

type CharacterLevelProps = {
    levelInfo: BattleVictoryRewardsLevel;
    expGain: number;
};

const CharacterLevelComponent = ({ levelInfo, expGain }: CharacterLevelProps) => {
    const [level, setLevel] = useState(levelInfo.oldLevel);
    const [exp, setExp] = useState(levelInfo.oldExp - getLevelExperience(levelInfo.oldLevel));
    const [nextLevelExp, setNextLevelExp] = useState(
        getLevelExperience(levelInfo.oldLevel + 1) - getLevelExperience(levelInfo.oldLevel),
    );

    useEffect(() => {
        void animateLevels();
    }, []);

    const animateLevels = async () => {
        let currentLevel = levelInfo.oldLevel;
        let animatedLevels = 0;

        await wait(500);
        while (animatedLevels < levelInfo.gainedLevels) {
            await wait(250);
            setExp(getLevelExperience(currentLevel + 1));
            await wait(750);
            currentLevel++;
            setExp(0);
            setLevel(currentLevel);
            setNextLevelExp(getLevelExperience(currentLevel + 1));
            animatedLevels++;
        }

        await wait(250);
        setExp(levelInfo.oldExp + expGain - getLevelExperience(currentLevel));
        setNextLevelExp(getLevelExperience(currentLevel + 1) - getLevelExperience(currentLevel));
    };

    return (
        <div className={style.characterItem}>
            <img
                src={AssetsService.getCharacterUri(levelInfo.characterImageUri)}
                alt={levelInfo.characterName}
            />
            <div className={style.characterLevel}>
                <p>
                    {levelInfo.characterName} • Lv.{level}
                </p>
                <StatBar current={exp} max={nextLevelExp} type="exp" />
            </div>
        </div>
    );
};
