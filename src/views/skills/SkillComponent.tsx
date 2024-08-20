import style from './SkillsComponent.module.scss';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { SkillDto } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { skillsClient } from '../../common/api/client';
import { ToastService } from '../../common/services/ToastService';
import { SoundService } from '../../common/services/SoundService';
import { useState } from 'react';
import { ConfirmDialog } from '../../common/components/ConfirmDialog';

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
            <TooltipComponent hint={renderHint(skill)}>
                <img
                    src={AssetsService.getSkillUri(skill.imageUri)}
                    alt={skill.label}
                    style={{ width: '3rem', height: '3rem' }}
                    draggable={false}
                />
            </TooltipComponent>
            {!skill.learned && (
                <button onClick={() => setShowConfirmLearnDialog(true)} className="btn" disabled={!canLearn}>
                    Learn
                </button>
            )}
            {showConfirmLearnDialog && (
                <ConfirmDialog onConfirm={learnSkill} onCancel={() => setShowConfirmLearnDialog(false)}>
                    <p>
                        Are you sure you want to learn <b className="primary">{skill.label}</b>
                        <br /> by using
                        <b> {skill.pointsRequired} skill points</b>?
                    </p>
                </ConfirmDialog>
            )}
        </div>
    );
};

const renderHint = (skill: SkillDto) => {
    return (
        <div className={style.skillHintItem}>
            <h3 className="subheader primary">{skill.label}</h3>
            <hr />
            <p>{skill.description}</p>
            {!skill.learned && (
                <>
                    <hr />
                    <p>Required level: {skill.lvlRequired ?? '---'}</p>
                    {skill.skillsRequired && (
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
