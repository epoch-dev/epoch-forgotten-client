import style from './EquipmentComponent.module.scss';
import { EquipmentSelectionComponent } from './EquipmentSelectionComponent';
import { CharacterStatsPanel } from './CharacterStatsPanel';
import { EquipmentGrid } from './EquipmentGrid';
import { useEquipment } from './useEquipment';
import { GameWindow } from '../../common/ui';
import { GameView } from '../game/types';

export const EquipmentComponent = () => {
    const {
        character,
        eqSelectionData,
        showEquipmentSelection,
        getEquipmentWeight,
        setView,
    } = useEquipment();

    if (!character) return null;

    return (
        <GameWindow title="Equipment" onClose={() => setView(GameView.Party)} size="lg">
            {eqSelectionData && <EquipmentSelectionComponent {...eqSelectionData} />}

            <div className={style.equipmentLayout}>
                <CharacterStatsPanel
                    character={character}
                    equipmentWeight={getEquipmentWeight()}
                />

                <EquipmentGrid
                    equipment={character.equipment}
                    onSelectSlot={showEquipmentSelection}
                    onNavigateSkills={() => setView(GameView.Skills)}
                />
            </div>
        </GameWindow>
    );
};
