import { CharacterEquipItemDtoTargetEnum, CharacterDto, ItemDto, ItemType } from '../../common/api/.generated';
import { AssetsService } from '../../common/services/AssetsService';
import { GameSlot } from '../../common/ui';
import { ItemComponent, ItemTooltip } from './ItemComponent';
import style from './EquipmentComponent.module.scss';

type RarityName = 'common' | 'uncommon' | 'rare' | 'unique' | 'epic' | 'mythical';

type EquipmentGridProps = {
    equipment: CharacterDto['equipment'];
    onSelectSlot: (
        itemLabel: string,
        types: ItemType[],
        currentItem?: ItemDto,
        target?: CharacterEquipItemDtoTargetEnum,
    ) => void;
    onNavigateSkills: () => void;
};

export const EquipmentGrid = ({ equipment, onSelectSlot, onNavigateSkills }: EquipmentGridProps) => {
    const getRarityName = (item?: ItemDto): RarityName | undefined => {
        if (!item) return undefined;
        return item.rarity.toLowerCase() as RarityName;
    };

    return (
        <div className={style.equipmentPanel}>
            <div className={style.equipmentHeader}>
                <h3>Equipment</h3>
                <button className={style.navBtn} onClick={onNavigateSkills} title="Skills">
                    <img src={AssetsService.getIcon('SKILLS')} alt="Skills" draggable={false} />
                </button>
            </div>

            <div className={style.equipmentGrid}>
                {/* Row 1: Charm, Head, Empty */}
                <EquipSlot
                    item={equipment.charm}
                    rarity={getRarityName(equipment.charm)}
                    label="Charm"
                    onClick={() => onSelectSlot('Charm', ['Charm'], equipment.charm)}
                />
                <EquipSlot
                    item={equipment.head}
                    rarity={getRarityName(equipment.head)}
                    label="Helmet"
                    onClick={() => onSelectSlot('Helmet', ['Head'], equipment.head)}
                />
                <div />

                {/* Row 2: Left Arm, Torso, Right Arm */}
                <EquipSlot
                    item={equipment.leftArm}
                    rarity={getRarityName(equipment.leftArm)}
                    label="Weapon"
                    onClick={() => onSelectSlot('Weapon', ['OneHanded', 'TwoHanded'], equipment.leftArm, 'Left')}
                />
                <EquipSlot
                    item={equipment.torso}
                    rarity={getRarityName(equipment.torso)}
                    label="Armor"
                    onClick={() => onSelectSlot('Armor', ['Torso'], equipment.torso)}
                />
                <EquipSlot
                    item={equipment.rightArm}
                    rarity={getRarityName(equipment.rightArm)}
                    label="Offhand"
                    onClick={() => onSelectSlot('Offhand', ['OneHanded', 'TwoHanded'], equipment.rightArm, 'Right')}
                />

                {/* Row 3: Empty, Legs, Empty */}
                <div />
                <EquipSlot
                    item={equipment.legs}
                    rarity={getRarityName(equipment.legs)}
                    label="Footwear"
                    onClick={() => onSelectSlot('Footwear', ['Legs'], equipment.legs)}
                />
                <div />
            </div>
        </div>
    );
};

type EquipSlotProps = {
    item?: ItemDto;
    rarity?: RarityName;
    label: string;
    onClick: () => void;
};

const EquipSlot = ({ item, rarity, label, onClick }: EquipSlotProps) => (
    <GameSlot
        isEmpty={!item}
        rarity={rarity}
        onClick={onClick}
        tooltipContent={item ? <ItemTooltip item={item} /> : undefined}
        className={style.equipSlot}>
        {item ? (
            <ItemComponent item={item} itemStyle={{ width: '100%', height: '100%' }} />
        ) : (
            <span className={style.slotLabel}>{label}</span>
        )}
    </GameSlot>
);
