import style from './BattleComponent.module.scss';
import { BattleResultComponent } from './BattleResultComponent';
import { BattleDock } from './BattleDock';
import { BattleField } from './BattleField';
import { useBattle } from './useBattle';

export const BattleComponent = () => {
    const {
        party,
        enemies,
        canEscape,
        selectedCharacter,
        selectedSkill,
        animatedSkill,
        victoryResults,
        defeatResults,
        characterCommand,
        hint,
        backgroundImage,
        isActionDisabled,
        skillSlots,
        defaultTargetId,
        handleSkillSelection,
        handleCharacterSelection,
        handleAttack,
        handleEscape,
        handleKeyPress,
    } = useBattle();

    return (
        <section onKeyDown={handleKeyPress} tabIndex={-1} className={style.battleWrapper}>
            {/* Background layer */}
            <div className={style.battleBackground} style={{ backgroundImage }} />

            {/* Bottom gradient bar - grounds the UI */}
            <div className={style.bottomBar} />

            {/* UI layer */}
            <div className={style.battleUI}>
                {/* Status hint */}
                {hint && <p className={style.infoItem}>{hint}</p>}

                {/* Battle result overlay */}
                {(victoryResults || defeatResults) && (
                    <BattleResultComponent victoryResults={victoryResults} defeatResults={defeatResults} />
                )}

                {/* Battlefield - character portraits */}
                <BattleField
                    party={party}
                    enemies={enemies}
                    selectedCharacterId={selectedCharacter?.id}
                    characterCommandTargetId={characterCommand?.targetId}
                    defaultTargetId={defaultTargetId}
                    animatedSkill={animatedSkill}
                    onCharacterSelect={handleCharacterSelection}
                />

                {/* Battle Dock - Centered action panel */}
                <BattleDock
                    hasSelectedCharacter={!!selectedCharacter}
                    selectedSkillName={selectedSkill?.name}
                    commandSkillName={characterCommand?.skillName}
                    skillSlots={skillSlots}
                    canEscape={canEscape}
                    isActionDisabled={isActionDisabled}
                    onSkillSelect={handleSkillSelection}
                    onAttack={handleAttack}
                    onEscape={handleEscape}
                />
            </div>
        </section>
    );
};
