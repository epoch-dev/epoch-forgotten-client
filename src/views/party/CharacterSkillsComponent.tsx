import style from './CharacterSkillsComponent.module.scss';
import { useEffect, useState } from 'react';
import { SkillsClient } from '../../common/api/client';
import { CharacterStats, SkillDto } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { AssetsService } from '../../common/services/AssetsService';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { ToastService } from '../../common/services/ToastService';

export const CharacterSkillComponent = () => {
    const { character, setView } = useGameStore();
    const [skills, setSkills] = useState<SkillDto[]>();

    useEffect(() => {
        if (!character) {
            return setView(GameView.Party);
        }
        void fetchSkills(character.id);
    }, []);

    if (!character) {
        setView(GameView.Party);
        return <></>;
    }

    const fetchSkills = async (characterId: string) => {
        const data = await SkillsClient.getSkillTree(characterId);
        setSkills(data.data.skills);
    };

    const learnSkill = async (skill: SkillDto) => {
        await SkillsClient.learnSkill({ characterId: character.id, skillName: skill.name });
        ToastService.success({ message: `${skill.label} learned` });
        await fetchSkills(character.id);
    };

    return (
        <section style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={style.characterWrapper}>
                <h2>
                    {character.name} | {character.level}
                </h2>
                <img
                    src={AssetsService.getCharacterUri(character.imageUri)}
                    alt={character.name}
                    draggable={false}
                />
                <hr />
                <AttributeRow label="Health" amount={character.attributes.health} name={'health'} />
                <AttributeRow label="Mana" amount={character.attributes.mana} name={'mana'} />
                <AttributeRow label="Strength" amount={character.attributes.str} name={'str'} />
                <AttributeRow label="Dexterity" amount={character.attributes.dex} name={'dex'} />
                <AttributeRow label="Poi" amount={character.attributes.poi} name={'poi'} />
                <AttributeRow label="Arcana" amount={character.attributes.arc} name={'arc'} />
                <hr />
                <AttributeRow label="Attribute points:" amount={character.attributePoints} />
                <AttributeRow label="Skill points:" amount={character.skillPoints} />
            </div>
            <div className={style.skillsWrapper}>
                <h2>Skill Tree</h2>
                {skills?.map((skill) => (
                    <div key={skill.name} className={style.skillItem}>
                        <TooltipComponent hint={<SkillHint skill={skill} />}>
                            <img
                                src={AssetsService.getSkillUri(skill.imageUri)}
                                alt={skill.label}
                                style={{ width: '3rem', height: '3rem' }}
                                draggable={false}
                            />
                        </TooltipComponent>
                        {!skill.learned && (
                            <button onClick={() => learnSkill(skill)} className="btn">
                                Learn
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </section>
    );
};

const AttributeRow = ({
    label,
    amount,
    name,
}: {
    label: string;
    amount: number;
    name?: keyof CharacterStats;
}) => {
    const { character, setCharacter } = useGameStore();

    if (!character) {
        return <></>;
    }

    const canUpgrade = name && name !== 'health' && name !== 'mana' && character.attributePoints > 0;

    const handleUpgrade = () => {
        // TODO - implement on backend
        if (!name || character.attributePoints <= 0) {
            return;
        }
        setCharacter({
            ...character,
            attributes: {
                ...character.attributes,
                [name]: character.attributes[name] + 1,
            },
            attributePoints: character.attributePoints - 1,
        });
    };

    return (
        <div className={style.attributeItem}>
            {label}
            <div className="bold">
                {amount}
                {canUpgrade && (
                    <img
                        onClick={handleUpgrade}
                        src={AssetsService.getIcon('PLUS')}
                        style={{ width: '1rem', height: '1rem' }}
                        draggable={false}
                    />
                )}
            </div>
        </div>
    );
};

const SkillHint = ({ skill }: { skill: SkillDto }) => {
    return (
        <div className={style.skillHintItem}>
            <h3 className="subheader primary">{skill.label}</h3>
            <hr />
            <p>{skill.description}</p>
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
        </div>
    );
};
