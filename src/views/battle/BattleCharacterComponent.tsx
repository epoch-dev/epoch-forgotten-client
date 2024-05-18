import style from './BattleCharacterComponent.module.scss';
import { BattleCharacter } from '../../common/api/.generated';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { ProgressBarComponent } from '../../common/components/ProgressBarComponent';

export const BattleCharacterComponent = ({
    character,
    isSelected,
    isTargeted,
    onClick,
}: {
    character: BattleCharacter;
    isSelected: boolean;
    isTargeted: boolean;
    onClick: () => void;
}) => {
    const characterClass = `${style.characterItem} ${isTargeted ? style.targetActive : ''} ${
        isSelected ? style.characterActive : ''
    } ${!character.isAlive ? style.characterDead : ''}`;

    const characterImgUri = character.isControlled
        ? AssetsService.getCharacterUri(character.imageUri)
        : AssetsService.getEnemyUri(character.imageUri);

    return (
        <TooltipComponent
            hint={
                <>
                    <p className="subtitle">{character.label}</p>
                    <p>
                        {character.statistics.health} / {character.statistics.maxHealth} HP
                    </p>
                    {character.isControlled && (
                        <p>
                            {character.statistics.mana} / {character.statistics.mana} MP
                        </p>
                    )}
                </>
            }>
            <div onClick={onClick} className={characterClass}>
                <img src={characterImgUri} alt={character.label} />
                <ProgressBarComponent
                    current={character.statistics.health}
                    max={character.statistics.maxHealth}
                />
            </div>
        </TooltipComponent>
    );
};
