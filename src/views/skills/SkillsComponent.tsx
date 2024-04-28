import style from './SkillsComponent.module.scss';
import { useEffect, useState } from 'react';
import { SkillsClient } from '../../common/api/client';
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
        const data = await SkillsClient.getSkillTree(characterId);
        setSkills(data.data.skills);
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
                <AttributeComponent label="Health" amount={character.attributes.health} name={'health'} />
                <AttributeComponent label="Mana" amount={character.attributes.mana} name={'mana'} />
                <AttributeComponent label="Strength" amount={character.attributes.str} name={'str'} />
                <AttributeComponent label="Dexterity" amount={character.attributes.dex} name={'dex'} />
                <AttributeComponent label="Poi" amount={character.attributes.poi} name={'poi'} />
                <AttributeComponent label="Arcana" amount={character.attributes.arc} name={'arc'} />
                <hr />
                <AttributeComponent label="Attribute points:" amount={character.attributePoints} />
                <AttributeComponent label="Skill points:" amount={character.skillPoints} />
            </div>
            <div className={style.skillsWrapper}>
                <h2>Skill Tree</h2>
                {skills?.map((skill) => (
                    <SkillComponent key={skill.name} skill={skill} />
                ))}
            </div>
        </section>
    );
};
