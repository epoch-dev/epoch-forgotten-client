import { BattleSkill } from '../../common/api/.generated';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { throttle } from '../../common/utils';
import style from './BattleComponent.module.scss';

type BattleDockProps = {
    hasSelectedCharacter: boolean;
    selectedSkillName?: string;
    commandSkillName?: string;
    skillSlots: (BattleSkill | null)[];
    canEscape: boolean;
    isActionDisabled: boolean;
    onSkillSelect: (skill: BattleSkill) => void;
    onAttack: () => void;
    onEscape: () => void;
};

export const BattleDock = ({
    hasSelectedCharacter,
    selectedSkillName,
    commandSkillName,
    skillSlots,
    canEscape,
    isActionDisabled,
    onSkillSelect,
    onAttack,
    onEscape,
}: BattleDockProps) => (
    <div className={style.battleDock}>
        {/* Run button (left) */}
        <button
            className={style.controlBtn}
            onClick={throttle(onEscape)}
            disabled={!canEscape || isActionDisabled}
            title="Run">
            Run
        </button>

        {/* Skill Grid */}
        {hasSelectedCharacter ? (
            <div className={style.skillGrid}>
                {skillSlots.map((skill, idx) =>
                    skill ? (
                        <TooltipComponent
                            key={skill.name}
                            config={{ width: '14rem' }}
                            hint={
                                <>
                                    <p className="subtitle">{skill.label}</p>
                                    <hr />
                                    <p>{skill.description}</p>
                                    <p style={{ marginTop: '0.5rem' }}>
                                        Mana: {skill.manaCost ?? '-'}
                                    </p>
                                </>
                            }>
                            <button
                                className={`${style.skillSlot} ${
                                    selectedSkillName === skill.name ||
                                    (!selectedSkillName && commandSkillName === skill.name)
                                        ? style.active
                                        : ''
                                }`}
                                onClick={throttle(() => onSkillSelect(skill), 100)}>
                                <span className={style.skillName}>{skill.label}</span>
                            </button>
                        </TooltipComponent>
                    ) : (
                        <div key={`empty-${idx}`} className={`${style.skillSlot} ${style.empty}`} />
                    ),
                )}
            </div>
        ) : (
            <span className={style.noCharacterHint}>Select a character</span>
        )}

        {/* Attack button (right) */}
        <button
            className={`${style.controlBtn} ${style.primary}`}
            onClick={throttle(onAttack)}
            disabled={isActionDisabled}
            title="Attack">
            Go
        </button>
    </div>
);
