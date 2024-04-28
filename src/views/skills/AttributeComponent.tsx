import style from './SkillsComponent.module.scss';
import { CharacterStats } from '../../common/api/.generated';
import { AssetsService } from '../../common/services/AssetsService';
import { useGameStore } from '../game/GameStore';

export const AttributeComponent = ({
    label,
    amount,
    name,
}: {
    label: string;
    amount: number;
    name?: keyof CharacterStats;
}) => {
    const { character, setCharacter } = useGameStore();

    if (!character) {
        return <></>;
    }

    const canUpgrade = name && name !== 'health' && name !== 'mana' && character.attributePoints > 0;

    const handleUpgrade = () => {
        // TODO - implement on backend
        if (!name || character.attributePoints <= 0) {
            return;
        }
        setCharacter({
            ...character,
            attributes: {
                ...character.attributes,
                [name]: character.attributes[name] + 1,
            },
            attributePoints: character.attributePoints - 1,
        });
    };

    return (
        <div className={style.attributeItem}>
            {label}
            <div className="bold">
                {amount}
                {canUpgrade && (
                    <img
                        onClick={handleUpgrade}
                        src={AssetsService.getIcon('PLUS')}
                        style={{ width: '1rem', height: '1rem' }}
                        draggable={false}
                    />
                )}
            </div>
        </div>
    );
};
