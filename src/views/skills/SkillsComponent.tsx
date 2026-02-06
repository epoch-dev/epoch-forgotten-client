import style from './SkillsComponent.module.scss';
import { CharacterSkillsPanel } from './CharacterSkillsPanel';
import { SkillTreesPanel } from './SkillTreesPanel';
import { useSkills } from './useSkills';
import { GameWindow } from '../../common/ui';
import { GameView } from '../game/types';

export const SkillsComponent = () => {
    const { character, uniqueSkills, classSkills, setView } = useSkills();

    if (!character) return null;

    return (
        <GameWindow title="Skills" onClose={() => setView(GameView.Party)} size="lg">
            <div className={style.skillsLayout}>
                <CharacterSkillsPanel
                    character={character}
                    onNavigateEquipment={() => setView(GameView.Equipment)}
                />

                <SkillTreesPanel
                    characterClass={character.class}
                    classSkills={classSkills}
                    uniqueSkills={uniqueSkills}
                />
            </div>
        </GameWindow>
    );
};
