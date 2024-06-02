import style from './SkillsComponent.module.scss';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { SkillDto } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { skillsClient } from '../../common/api/client';
import { ToastService } from '../../common/services/ToastService';
import { SoundService } from '../../common/services/SoundService';

export const SkillComponent = ({ skill }: { skill: SkillDto }) => {
    const { character, setCharacter } = useGameStore();


    if (!character) {
        return <></>;
    }

    const soundService = SoundService.getInstance();
    const canLearn = !skill.learned && character.skillPoints > 0;

    const learnSkill = async (skill: SkillDto) => {
        await skillsClient.learnSkill({ characterId: character.id, skillName: skill.name });
        soundService.newSkill();
        ToastService.success({ message: `${skill.label} learned` });
        setCharacter({
            ...character,
            skillPoints: character.skillPoints - (skill.pointsRequired ?? 0),
        });
    };

    return (
        <div key={skill.name} className={style.skillItem}>
            <TooltipComponent hint={renderHint(skill)}>
                <img
                    src={AssetsService.getSkillUri(skill.imageUri)}
                    alt={skill.label}
                    style={{ width: '3rem', height: '3rem' }}
                    draggable={false}
                />
            </TooltipComponent>
            {canLearn && (
                <button onClick={() => learnSkill(skill)} className="btn">
                    Learn
                </button>
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
