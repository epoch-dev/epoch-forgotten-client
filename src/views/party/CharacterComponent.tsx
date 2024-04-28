import style from './PartyComponent.module.scss';
import { MouseEvent } from 'react';
import { CharacterDto } from '../../common/api/.generated';
import { AssetsService } from '../../common/services/AssetsService';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';

export const CharacterComponent = ({ character }: { character: CharacterDto }) => {
    const { setCharacter, setView } = useGameStore();

    const navigateToSkills = (event: MouseEvent) => {
        event.stopPropagation();
        setCharacter(character);
        setView(GameView.Skills);
    };

    const navigateToEquipment = (event: MouseEvent) => {
        event.stopPropagation();
        console.log('TODO - equipment page');
    };

    return (
        <>
            <p className="bold primary">
                {character.name} | {character.level}
            </p>
            <hr />
            <img
                src={AssetsService.getCharacterUri(character.imageUri)}
                alt={character.name}
                draggable={false}
            />
            <hr />
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <div className={style.characterNavIcon}>
                    <img
                        onClick={(e) => navigateToSkills(e)}
                        src={AssetsService.getIcon('SKILLS')}
                        style={{ width: '2rem', height: '2rem' }}
                        draggable={false}
                    />
                </div>
                <div className={style.characterNavIcon}>
                    <img
                        onClick={(e) => navigateToEquipment(e)}
                        src={AssetsService.getIcon('EQUIPMENT')}
                        style={{ width: '2rem', height: '2rem' }}
                        draggable={false}
                    />
                </div>
            </div>
        </>
    );
};
