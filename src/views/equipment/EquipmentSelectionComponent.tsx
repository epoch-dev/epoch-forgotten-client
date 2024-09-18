import style from './EquipmentSelectionComponent.module.scss';
import { CharacterEquipItemDtoTargetEnum, ItemDto, ItemType } from '../../common/api/.generated';
import { charactersClient, itemsClient } from '../../common/api/client';
import { useGameStore } from '../game/GameStore';
import { useEffect, useState } from 'react';
import { ItemComponent } from './ItemComponent';
import { SoundService } from '../../common/services/SoundService';
import { throttle } from '../../common/utils';

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

    return (
        <div className="modalBackdrop">
            <div className="modalWrapper">
                <p className="subtitle dark" style={{ marginBottom: '2rem' }}>
                    Select new <b>{itemLabel}</b> to equip
                </p>
                <div className={style.itemsWrapper}>
                    {items.map((item) => (
                        <div
                            onClick={throttle(() => equipItem(item))}
                            key={item.id}
                            className={`${style.itemItem} ${item.characterId ? style.itemDisabled : ''}`}>
                            <ItemComponent item={item} itemStyle={{ width: '3rem', height: '3rem' }} />
                            <p>{item.label}</p>
                        </div>
                    ))}
                </div>
                {currentItem && (
                    <button
                        onClick={throttle(unEquipItem)}
                        className="modalCloseBtn"
                        style={{ marginTop: '2rem' }}>
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
