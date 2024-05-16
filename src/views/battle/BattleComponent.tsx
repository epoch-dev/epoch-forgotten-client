import style from './BattleComponent.module.scss';
import { useEffect, useState } from 'react';
import { BattleCharacter, BattleMoveCommand, BattleSkill } from '../../common/api/.generated';
import { battleClient } from '../../common/api/client';
import { GameView } from '../game/types';
import { useGameStore } from '../game/GameStore';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { ToastService } from '../../common/services/ToastService';
import { BattleCharacterComponent } from './BattleCharacterComponent';

export const BattleComponent = () => {
    const { setView } = useGameStore();
    const [party, setParty] = useState<BattleCharacter[]>([]);
    const [enemies, setEnemies] = useState<BattleCharacter[]>([]);
    const [selectedCharacter, setSelectedCharacter] = useState<BattleCharacter | undefined>();
    const [selectedSkill, setSelectedSkill] = useState<BattleSkill | undefined>();
    const [commands, setCommands] = useState<BattleMoveCommand[]>([]);

    const characterCommand = commands.find((c) => c.characterId === selectedCharacter?.id);

    const hint = !selectedCharacter ? 'Select character' : !selectedSkill ? 'Select skill' : 'Select target';

    useEffect(() => {
        void loadBattle();
    }, []);

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
        const turnResult = await battleClient.continueBattle({ commands });

        turnResult.data.moveResults.forEach((moveResult) => {
            const character = [...party, ...enemies].find((c) => c.id === moveResult.characterId)!;
            const skill = character.skills.find((s) => (s.label = moveResult.skillLabel))!;
            character.statistics.mana -= skill.manaCost ?? 0;
            moveResult.moveLogs.forEach((log) => {
                const target = [...party, ...enemies].find((c) => c.id === log.targetId)!;
                if (log.damage) {
                    // damage animation
                    target.statistics.health -= log.damage;
                }
                if (log.healing) {
                    // healing animation
                    target.statistics.health += log.damage;
                }
                if (target.statistics.health < 0) {
                    target.isAlive = false;
                    target.statistics.health = 0;
                }
                updateCharacters(target);
                console.log(
                    `${character.label} hits ${target.label} (${target.statistics.health}) for ${log.damage} damage.`,
                );
            });
            updateCharacters(character);
        });

        if (turnResult.data.victory) {
            ToastService.success({ message: 'Victory' });
        }

        if (turnResult.data.defeat) {
            ToastService.error({ message: 'Defeat' });
        }
    };

    const handleRun = () => {
        setView(GameView.World);
    };

    return (
        <section className={style.battleWrapper}>
            <p className={style.infoItem}>{hint}</p>
            <div className={style.fieldWrapper}>
                <div className={style.alliesWrapper}>
                    {party.map((character) => (
                        <BattleCharacterComponent
                            key={character.id}
                            character={character}
                            isSelected={selectedCharacter?.id === character.id}
                            isTargeted={characterCommand?.targetId === character.id}
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
                    <button onClick={handleAttack} className={style.controlItem}>
                        Attack
                    </button>
                    <button onClick={handleRun} className={style.controlItem}>
                        Run
                    </button>
                </div>
            </div>
        </section>
    );
};
