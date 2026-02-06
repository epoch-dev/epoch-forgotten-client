import style from './EquipmentSelectionComponent.module.scss';
import { CharacterEquipItemDtoTargetEnum, ItemDto, ItemType } from '../../common/api/.generated';
import { charactersClient, itemsClient } from '../../common/api/client';
import { useGameStore } from '../game/GameStore';
import { useEffect, useState } from 'react';
import { ItemComponent, ItemTooltip } from './ItemComponent';
import { SoundService } from '../../common/services/SoundService';
import { throttle } from '../../common/utils';
import { ModalOverlay, GameButton, GameSlot } from '../../common/ui';

export type EquipmentSelectionComponentProps = {
    currentItem?: ItemDto;
    types: ItemType[];
    target: CharacterEquipItemDtoTargetEnum;
    itemLabel: string;
    onClose: () => void;
};

export const EquipmentSelectionComponent = ({
    currentItem,
    types,
    target,
    itemLabel,
    onClose,
}: EquipmentSelectionComponentProps) => {
    const { character, setCharacter } = useGameStore();
    const [items, setItems] = useState<ItemDto[]>([]);

    const soundService = SoundService.getInstance();

    useEffect(() => {
        void fetchItems();
    }, []);

    if (!character) {
        return <></>;
    }

    const fetchItems = async () => {
        const itemsData = await itemsClient.getItems();
        setItems(itemsData.data.filter((i) => types.includes(i.type)));
    };

    const equipItem = async (item: ItemDto) => {
        if (item.characterId) {
            return;
        }
        const characterData = await charactersClient.equipItem({
            characterId: character.id,
            itemId: item.id,
            target,
        });
        soundService.equip(item.type);
        setCharacter(characterData.data);
        onClose();
    };

    const unEquipItem = async () => {
        if (!currentItem) {
            return;
        }
        const characterData = await charactersClient.unEquipItem({
            characterId: character.id,
            itemId: currentItem.id,
        });
        soundService.unequip();
        setCharacter(characterData.data);
        onClose();
    };

    const getRarityName = (rarity: string) => {
        return rarity.toLowerCase() as 'common' | 'uncommon' | 'rare' | 'unique' | 'epic' | 'mythical';
    };

    return (
        <ModalOverlay title={`Select ${itemLabel}`} onClose={onClose}>
            <p className={style.subtitle}>
                Choose a new <b>{itemLabel}</b> to equip
            </p>

            <div className={style.itemsGrid}>
                {items.map((item) => (
                    <div
                        key={item.id}
                        className={`${style.itemWrapper} ${item.characterId ? style.disabled : ''}`}
                        onClick={throttle(() => equipItem(item))}>
                        <GameSlot
                            rarity={getRarityName(item.rarity)}
                            tooltipContent={<ItemTooltip item={item} />}>
                            <ItemComponent item={item} itemStyle={{ width: '100%', height: '100%' }} />
                        </GameSlot>
                        <span className={style.itemLabel}>{item.label}</span>
                    </div>
                ))}

                {items.length === 0 && (
                    <p className={style.emptyMessage}>No items available</p>
                )}
            </div>

            <div className={style.actions}>
                {currentItem && (
                    <GameButton variant="danger" onClick={throttle(unEquipItem)}>
                        Unequip
                    </GameButton>
                )}
                <GameButton variant="secondary" onClick={onClose}>
                    Cancel
                </GameButton>
            </div>
        </ModalOverlay>
    );
};
