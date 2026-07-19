import { useEffect, useRef, useState } from 'react';
import {
    BattleDefeatResults,
    BattleVictoryRewards,
    BattleVictoryRewardsLevel,
} from '../../common/api/.generated';
import { getLevelExperience } from '../../common/api/definitions/levelUtil';
import { ProgressBarComponent } from '../../common/components/ProgressBarComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { GameEventHandler } from '../../common/services/GameEventHandler';
import { CSS_COLOR } from '../../common/styles';
import { wait } from '../../common/utils';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { ScenesService } from '../scenes/ScenesService';
import style from './BattleResultComponent.module.scss';

export const BattleResultComponent = ({
    victoryResults,
    defeatResults,
}: {
    victoryResults: BattleVictoryRewards | undefined;
    defeatResults: BattleDefeatResults | undefined;
}) => {
    const { scene, setView } = useGameStore();
    const isClosingRef = useRef(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleClose = async () => {
        if (isClosingRef.current) {
            return;
        }
        isClosingRef.current = true;
        setIsClosing(true);

        setView(GameView.World);
        const events = [...(victoryResults?.events ?? []), ...(defeatResults?.events ?? [])];
        try {
            await GameEventHandler.present(events);
            const eventNavigation = useGameStore.getState();
            await ScenesService.initialize();
            await scene?.loadScene();
            if (eventNavigation.view !== GameView.World) {
                useGameStore.setState((current) => ({
                    ...current,
                    view: eventNavigation.view,
                    npcName: eventNavigation.npcName,
                    encounter: eventNavigation.encounter,
                    encounterName: eventNavigation.encounterName,
                }));
            }
        } catch {
            isClosingRef.current = false;
            setIsClosing(false);
        }
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
                <button
                    type="button"
                    onClick={() => void handleClose()}
                    className={style.closeBtn}
                    disabled={isClosing}>
                    Close
                </button>
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
                            {victoryResults?.items.map((item, itemIndex) => (
                                <p key={`${itemIndex}-${item.id}`}>{item.label}</p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <button
                type="button"
                onClick={() => void handleClose()}
                className={style.closeBtn}
                disabled={isClosing}>
                Close
            </button>
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
    const [transitionTime, setTransitionTime] = useState(0.75);

    useEffect(() => {
        void animateLevels();
    }, []);

    const animateLevels = async () => {
        let currentLevel = levelInfo.oldLevel;
        let animatedLevels = 0;

        await wait(500);
        setTransitionTime(0.5);
        while (animatedLevels < levelInfo.gainedLevels) {
            await wait(250);
            setTransitionTime(0.75);
            setExp(getLevelExperience(currentLevel + 1));
            await wait(750);
            setTransitionTime(0);
            currentLevel++;
            setExp(0);
            setLevel(currentLevel);
            setNextLevelExp(getLevelExperience(currentLevel + 1));
            animatedLevels++;
        }

        await wait(250);
        setTransitionTime(0.75);
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
                    {levelInfo.characterName} | {level}
                </p>
                <ProgressBarComponent
                    current={exp}
                    max={nextLevelExp}
                    fillColor={CSS_COLOR.EPIC}
                    style={{ transitionTime }}
                />
            </div>
        </div>
    );
};
