import style from './SkillsComponent.module.scss';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { SkillDto } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { skillsClient } from '../../common/api/client';
import { ToastService } from '../../common/services/ToastService';
import { SoundService } from '../../common/services/SoundService';
import { useState } from 'react';
import { throttle } from '../../common/utils';
import { ConfirmModal } from '../../common/ui';

const soundService = SoundService.getInstance();

export const SkillComponent = ({ skill }: { skill: SkillDto }) => {
    const { character, setCharacter } = useGameStore();
    const [showConfirmLearnDialog, setShowConfirmLearnDialog] = useState(false);

    if (!character) {
        return <></>;
    }

    const canLearn =
        !skill.learned &&
        character.skillPoints >= (skill.pointsRequired ?? 0) &&
        character.level >= (skill.lvlRequired ?? 0);
    const skillClass = `${style.skillItem} ${!skill.learned ? style.skillInactive : ''}`;

    const learnSkill = async () => {
        await skillsClient.learnSkill({ characterId: character.id, skillName: skill.name });
        soundService.newSkill();
        ToastService.success({ message: `${skill.label} learned` });
        setShowConfirmLearnDialog(false);
        setCharacter({
            ...character,
            skillPoints: character.skillPoints - (skill.pointsRequired ?? 0),
        });
    };

    return (
        <div key={skill.name} className={skillClass}>
            <TooltipComponent hint={renderHint(skill)} config={{ width: '16rem' }}>
                <img
                    src={AssetsService.getSkillUri(skill.imageUri)}
                    alt={skill.label}
                    draggable={false}
                />
            </TooltipComponent>
            {!skill.learned && (
                <button onClick={() => setShowConfirmLearnDialog(true)} disabled={!canLearn}>
                    Learn
                </button>
            )}
            {showConfirmLearnDialog && (
                <ConfirmModal
                    title="Learn Skill"
                    onConfirm={throttle(learnSkill)}
                    onCancel={() => setShowConfirmLearnDialog(false)}
                    confirmText="Learn"
                    cancelText="Cancel">
                    <p>
                        Learn <b>{skill.label}</b> for <b>{skill.pointsRequired} skill points</b>?
                    </p>
                </ConfirmModal>
            )}
        </div>
    );
};

const renderHint = (skill: SkillDto) => {
    return (
        <div className={style.skillHintItem}>
            <h3>{skill.label}</h3>
            <hr />
            <p>{skill.description}</p>
            {!skill.learned && (
                <>
                    <hr />
                    <p>Required level: {skill.lvlRequired ?? '---'}</p>
                    <p>Skill points: {skill.pointsRequired ?? '---'}</p>
                    {skill.skillsRequired && skill.skillsRequired.length > 0 && (
                        <>
                            <span>Required skills:</span>
                            {skill.skillsRequired.map((requiredSkill) => (
                                <li key={requiredSkill}>{requiredSkill}</li>
                            ))}
                        </>
                    )}
                </>
            )}
        </div>
    );
};
