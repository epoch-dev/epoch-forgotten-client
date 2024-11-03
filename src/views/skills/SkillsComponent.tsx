import style from './SkillsComponent.module.scss';
import { useEffect, useState } from 'react';
import { skillsClient } from '../../common/api/client';
import { SkillDto } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { AssetsService } from '../../common/services/AssetsService';
import { AttributeComponent } from './AttributeComponent';
import { SkillComponent } from './SkillComponent';

export const SkillsComponent = () => {
    const { character, setView } = useGameStore();
    const [uniqueSkills, setUniqueSkills] = useState<SkillDto[]>();
    const [classSkills, setClassSkills] = useState<SkillDto[]>();

    useEffect(() => {
        if (!character) {
            return setView(GameView.Party);
        }
        void fetchSkills(character.id);
    }, [character]);

    if (!character) {
        setView(GameView.Party);
        return <></>;
    }

    const fetchSkills = async (characterId: string) => {
        const skillRes = await skillsClient.getSkillTree(characterId);
        setUniqueSkills(skillRes.data.uniqueSkills);
        setClassSkills(skillRes.data.classSkills);
    };

    return (
        <section style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div className={style.characterWrapper}>
                <h2>
                    {character.label} | {character.level}
                </h2>
                <img
                    src={AssetsService.getCharacterUri(character.imageUri)}
                    alt={character.label}
                    draggable={false}
                />
                <AttributeComponent label="Health" amount={character.statistics.health} name={'health'} />
                <AttributeComponent label="Mana" amount={character.statistics.mana} name={'mana'} />
                <hr />
                <AttributeComponent label="Strength" amount={character.attributes.str} name={'str'} />
                <AttributeComponent label="Dexterity" amount={character.attributes.dex} name={'dex'} />
                <AttributeComponent label="Poi" amount={character.attributes.poi} name={'poi'} />
                <AttributeComponent label="Arcana" amount={character.attributes.arc} name={'arc'} />
                <br />
                <AttributeComponent label="Attribute points:" amount={character.attributePoints} />
                <AttributeComponent label="Skill points:" amount={character.skillPoints} />
            </div>
            <div className={style.skillsWrapper}>
                <div className={style.skillsHeaderWrapper}>
                    <h2>Skill Tree |</h2>
                    <div onClick={() => setView(GameView.Equipment)}>
                        <img
                            src={AssetsService.getIcon('EQUIPMENT')}
                            style={{ width: '1.6rem' }}
                            draggable={false}
                        />
                    </div>
                </div>
                <div className={style.skillTreesWrapper}>
                    <div className={style.skillTreeWrapper}>
                        <b>{character.class}</b>
                        <br />
                        {classSkills?.map((skill, index) => (
                            <div key={skill.name} className={style.skillWrapper}>
                                <SkillComponent skill={skill} />
                                {index < classSkills.length - 1 && <div className={style.dashedLine} />}
                            </div>
                        ))}
                    </div>
                    <div className={style.skillTreeWrapper}>
                        <b>Bloodline</b>
                        <br />
                        {uniqueSkills?.map((skill, index) => (
                            <div key={skill.name} className={style.skillWrapper}>
                                <SkillComponent skill={skill} />
                                {index < uniqueSkills.length - 1 && <div className={style.dashedLine} />}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
