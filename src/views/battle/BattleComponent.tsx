import style from './BattleComponent.module.scss';
import { useEffect, useState } from 'react';
import {
    BattleCharacter,
    BattleMoveCommand,
    BattleMoveResult,
    BattleSkill,
    BattleVictoryRewards,
    SceneDataDto,
} from '../../common/api/.generated';
import { battleClient } from '../../common/api/client';
import { GameView } from '../game/types';
import { useGameStore } from '../game/GameStore';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { BattleCharacterComponent } from './BattleCharacterComponent';
import { wait } from '../../common/utils';
import { ScenesService } from '../scenes/ScenesService';
import { AssetsService } from '../../common/services/AssetsService';
import { BattleResultComponent } from './BattleResultComponent';

export const BattleComponent = () => {
    const { setView } = useGameStore();
    const [scene, setScene] = useState<SceneDataDto | undefined>();
    const [party, setParty] = useState<BattleCharacter[]>([]);
    const [enemies, setEnemies] = useState<BattleCharacter[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<BattleCharacter | undefined>();
    const [selectedSkill, setSelectedSkill] = useState<BattleSkill | undefined>();
    const [commands, setCommands] = useState<BattleMoveCommand[]>([]);
    const [animatedSkill, setAnimatedSkill] = useState<BattleMoveResult | undefined>();
    const [victory, setVictory] = useState<BattleVictoryRewards | undefined>();
    const [defeat, setDefeat] = useState(false);

    const characterCommand = commands.find((c) => c.characterId === selectedCharacter?.id);

    const hint =
        victory || defeat
            ? ''
            : !selectedCharacter
            ? 'Select character'
            : !selectedSkill
            ? 'Select skill'
            : 'Select target';

    useEffect(() => {
        void loadScene();
        void loadBattle();
    }, []);

    const loadScene = async () => {
        const sceneData = await ScenesService.getSceneData();
        setScene(sceneData);
    };

    const loadBattle = async () => {
        const battleData = await battleClient.loadBattle();
        setParty(battleData.data.state.characters.filter((c) => c.isControlled));
        setEnemies(battleData.data.state.characters.filter((c) => !c.isControlled));
    };

    const handleCharacterSelection = (target: BattleCharacter) => {
        if (!target.isAlive) {
            return;
        }
        if (selectedCharacter && selectedSkill) {
            setCommands((prev) => [
                ...prev.filter((c) => c.characterId !== selectedCharacter.id),
                {
                    characterId: selectedCharacter.id,
                    skillName: selectedSkill.name,
                    targetId: target.id,
                },
            ]);
            setSelectedCharacter(undefined);
            setSelectedSkill(undefined);
        } else if (target.isControlled) {
            setSelectedCharacter(target);
        }
    };

    const updateCharacters = (character: BattleCharacter) => {
        if (character.isControlled) {
            setParty((prev) => prev.map((c) => (c.id === character.id ? character : c)));
        } else {
            setEnemies((prev) => prev.map((c) => (c.id === character.id ? character : c)));
        }
    };

    const handleAttack = async () => {
        setSelectedCharacter(undefined);
        setSelectedSkill(undefined);

        const turnResult = await battleClient.continueBattle({ commands });

        for (const moveResult of turnResult.data.moveResults) {
            setAnimatedSkill(moveResult);
            const character = [...party, ...enemies].find((c) => c.id === moveResult.characterId)!;
            const skill = character.skills.find((s) => s.label === moveResult.skillLabel)!;
            character.statistics.mana -= skill.manaCost ?? 0;
            moveResult.moveLogs.forEach((log) => {
                const target = [...party, ...enemies].find((c) => c.id === log.targetId)!;
                target.statistics.health -= log.hits.reduce((prev, curr) => prev + curr.value, 0);
                if (target.statistics.health < 0) {
                    target.isAlive = false;
                    setCommands((prev) => prev.filter((c) => c.targetId !== target.id));
                }
                target.statistics.health = Math.max(
                    0,
                    Math.min(target.statistics.health, target.statistics.maxHealth),
                );
                updateCharacters(target);
            });
            updateCharacters(character);
            await wait(1000); // animating
        }
        setAnimatedSkill(undefined);

        if (turnResult.data.victory) {
            setVictory(turnResult.data.victory);
        }
        if (turnResult.data.defeat) {
            setDefeat(true);
        }
    };

    const handleRun = () => {
        setView(GameView.World);
    };

    return (
        <section
            className={style.battleWrapper}
            style={
                scene ? { backgroundImage: `url(${AssetsService.getSceneUri(scene?.battleImageUri)})` } : {}
            }>
            <p className={style.infoItem}>{hint}</p>
            <BattleResultComponent victory={victory} defeat={defeat} />
            <div className={style.fieldWrapper}>
                <div className={style.alliesWrapper}>
                    {party.map((character) => (
                        <BattleCharacterComponent
                            key={character.id}
                            character={character}
                            isSelected={selectedCharacter?.id === character.id}
                            isTargeted={characterCommand?.targetId === character.id}
                            animatedSkill={animatedSkill}
                            onClick={() => handleCharacterSelection(character)}
                        />
                    ))}
                </div>
                <div className={style.enemiesWrapper}>
                    {enemies.map((enemy) => (
                        <BattleCharacterComponent
                            key={enemy.id}
                            character={enemy}
                            isSelected={selectedCharacter?.id === enemy.id}
                            isTargeted={characterCommand?.targetId === enemy.id}
                            animatedSkill={animatedSkill}
                            onClick={() => handleCharacterSelection(enemy)}
                        />
                    ))}
                </div>
            </div>
            <div className={style.actionsWrapper}>
                <div className={style.skillsWrapper}>
                    {selectedCharacter &&
                        selectedCharacter.skills
                            .filter((skill) => skill.kind !== 'Passive')
                            .map((skill) => (
                                <TooltipComponent
                                    key={skill.name}
                                    config={{ containerWidth: '100%', width: '20rem' }}
                                    hint={
                                        <>
                                            <p className="subtitle">{skill.label}</p>
                                            <hr />
                                            <p>{skill.description}</p>
                                            <p>Mana cost: {skill.manaCost ?? '-'}</p>
                                        </>
                                    }>
                                    <button
                                        onClick={() => setSelectedSkill(skill)}
                                        className={`${style.skillItem} ${
                                            selectedSkill?.name === skill.name ||
                                            (!selectedSkill && characterCommand?.skillName === skill.name)
                                                ? style.skillActive
                                                : ''
                                        }`}>
                                        {skill.label}
                                    </button>
                                </TooltipComponent>
                            ))}
                </div>
                <div className={style.controlsWrapper}>
                    <button
                        onClick={handleAttack}
                        className={style.controlItem}
                        disabled={animatedSkill !== undefined || victory !== undefined || defeat}>
                        Attack
                    </button>
                    <button
                        onClick={handleRun}
                        className={style.controlItem}
                        disabled={animatedSkill !== undefined || victory !== undefined || defeat}>
                        Run
                    </button>
                </div>
            </div>
        </section>
    );
};
