import style from './EquipmentSelectionComponent.module.scss';
import { CharacterEquipItemDtoTargetEnum, ItemDto, ItemType } from '../../common/api/.generated';
import { charactersClient, itemsClient } from '../../common/api/client';
import { useGameStore } from '../game/GameStore';
import { useEffect, useState } from 'react';
import { ItemComponent } from './ItemComponent';

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
        setCharacter(characterData.data);
        onClose();
    };

    return (
        <div className="modalBackdrop">
            <div className="modalWrapper">
                <p className="subtitle dark" style={{ marginBottom: '2rem' }}>
                    Select new <b>{itemLabel}</b> to equip
                </p>
                {items.map((item) => (
                    <div
                        onClick={() => equipItem(item)}
                        key={item.id}
                        className={`${style.itemItem} ${item.characterId ? style.itemDisabled : ''}`}>
                        <ItemComponent item={item} />
                        <p>{item.label}</p>
                    </div>
                ))}
                {currentItem && (
                    <button onClick={unEquipItem} className="modalCloseBtn" style={{ marginTop: '2rem' }}>
                        Unequip
                    </button>
                )}
                <button onClick={onClose} className="modalCloseBtn" style={{ marginTop: '1rem' }}>
                    Cancel
                </button>
            </div>
        </div>
    );
};
