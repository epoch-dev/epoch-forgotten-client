import style from './PartyComponent.module.scss';
import { MouseEvent } from 'react';
import { CharacterDto } from '../../common/api/.generated';
import { AssetsService } from '../../common/services/AssetsService';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { getLevelExperience } from '../../common/api/.generated/levelUtil';

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
        <>
            <TooltipComponent
                hint={
                    <p>
                        {character.exp} / {getLevelExperience(character.level + 1)} Experience
                    </p>
                }>
                <p className="bold primary">
                    {character.name} | {character.level}
                </p>
            </TooltipComponent>
            <hr />
            <img
                src={AssetsService.getCharacterUri(character.imageUri)}
                alt={character.name}
                draggable={false}
            />
            <hr />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <div className={style.characterNavIcon} onClick={(e) => navigateToSkills(e)}>
                    <img
                        src={AssetsService.getIcon('SKILLS')}
                        style={{ width: '2rem', height: '2rem' }}
                        draggable={false}
                    />
                </div>
                <div className={style.characterNavIcon} onClick={(e) => navigateToEquipment(e)}>
                    <img
                        src={AssetsService.getIcon('EQUIPMENT')}
                        style={{ width: '2rem', height: '2rem' }}
                        draggable={false}
                    />
                </div>
            </div>
        </>
    );
};
