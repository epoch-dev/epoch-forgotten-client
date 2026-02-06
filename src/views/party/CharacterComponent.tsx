import { MouseEvent } from 'react';
import { CharacterDto } from '../../common/api/.generated';
import { getLevelExperience } from '../../common/api/definitions/levelUtil';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { GameCard, StatBar } from '../../common/ui';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import style from './PartyComponent.module.scss';

export const CharacterComponent = ({ character }: { character: CharacterDto }) => {
    const { setCharacter, setView } = useGameStore();

    const navigateToSkills = (event: MouseEvent) => {
        event.stopPropagation();
        setCharacter(character);
        setView(GameView.Skills);
    };

    const navigateToEquipment = (event: MouseEvent) => {
        event.stopPropagation();
        setCharacter(character);
        setView(GameView.Equipment);
    };

    return (
        <GameCard
            image={AssetsService.getCharacterUri(character.imageUri)}
            imageAlt={character.label}
            onClick={() => {}}>
            <TooltipComponent
                hint={
                    <p>
                        {character.exp} / {getLevelExperience(character.level + 1)} Experience
                    </p>
                }
                config={{ containerWidth: '100%' }}>
                <p className={style.characterName}>
                    {character.label} <span className={style.level}>Lv.{character.level}</span>
                </p>
            </TooltipComponent>

            <div className={style.statsWrapper}>
                <StatBar
                    current={character.statistics.health}
                    max={character.statistics.maxHealth}
                    type="health"
                />
                <StatBar
                    current={character.statistics.mana}
                    max={character.statistics.maxMana}
                    type="mana"
                />
            </div>

            <div className={style.navIcons}>
                <button className={style.iconBtn} onClick={navigateToSkills} title="Skills">
                    <img src={AssetsService.getIcon('SKILLS')} alt="Skills" draggable={false} />
                </button>
                <button className={style.iconBtn} onClick={navigateToEquipment} title="Equipment">
                    <img src={AssetsService.getIcon('EQUIPMENT')} alt="Equipment" draggable={false} />
                </button>
            </div>
        </GameCard>
    );
};
