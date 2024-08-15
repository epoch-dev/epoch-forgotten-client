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
    const [skills, setSkills] = useState<SkillDto[]>();

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
        setSkills([...skillRes.data.uniqueSkills, ...skillRes.data.classSkills]);
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
                {skills?.map((skill) => (
                    <SkillComponent key={skill.name} skill={skill} />
                ))}
            </div>
        </section>
    );
};
