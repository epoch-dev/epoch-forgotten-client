import { useEffect, useState } from 'react';
import { skillsClient } from '../../common/api/client';
import { SkillDto } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';

export const useSkills = () => {
    const { character, setView } = useGameStore();
    const [uniqueSkills, setUniqueSkills] = useState<SkillDto[]>();
    const [classSkills, setClassSkills] = useState<SkillDto[]>();

    useEffect(() => {
        if (!character) {
            setView(GameView.Party);
            return;
        }
        void fetchSkills(character.id);
    }, [character]);

    const fetchSkills = async (characterId: string) => {
        const skillRes = await skillsClient.getSkillTree(characterId);
        setUniqueSkills(skillRes.data.uniqueSkills);
        setClassSkills(skillRes.data.classSkills);
    };

    return {
        character,
        uniqueSkills,
        classSkills,
        setView,
    };
};
