import style from './SkillsComponent.module.scss';
import { AssetsService } from '../../common/services/AssetsService';
import { useGameStore } from '../game/GameStore';
import { CharacterAttrs, CharacterImproveAttributeDtoAttributeEnum } from '../../common/api/.generated';
import { charactersClient } from '../../common/api/client';
import { SoundService } from '../../common/services/SoundService';
import { throttle } from '../../common/utils';

export const AttributeComponent = ({
    label,
    amount,
    name,
}: {
    label: string;
    amount: number;
    name?: keyof CharacterAttrs;
}) => {
    const { character, setCharacter } = useGameStore();

    if (!character) {
        return <></>;
    }

    const soundService = SoundService.getInstance();
    const canUpgrade = name && name !== 'health' && name !== 'mana' && character.attributePoints > 0;

    const handleUpgrade = async () => {
        if (!name || character.attributePoints <= 0) {
            return;
        }
        const updatedCharacterData = await charactersClient.improveAttribute({
            characterId: character.id,
            attribute: name as CharacterImproveAttributeDtoAttributeEnum,
        });
        soundService.attrUp();
        setCharacter({
            ...updatedCharacterData.data,
        });
    };

    return (
        <div className={style.attributeItem}>
            {label}
            <div className="bold">
                {amount}
                {canUpgrade && (
                    <img
                        onClick={throttle(handleUpgrade, 100)}
                        src={AssetsService.getIcon('PLUS')}
                        style={{ width: '1rem', height: '1rem' }}
                        draggable={false}
                    />
                )}
            </div>
        </div>
    );
};
