import style from './InventoryComponent.module.scss';
import { useEffect, useMemo, useState } from 'react';
import { itemsClient, usersClient } from '../../common/api/client';
import { ItemDto } from '../../common/api/.generated';
import { ItemComponent, ItemTooltip } from '../equipment/ItemComponent';
import { GameWindow, GameGrid, GameSlot, ConfirmModal } from '../../common/ui';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';

const GRID_SIZE = 98;

export const InventoryComponent = () => {
    const { setView } = useGameStore();
    const [gold, setGold] = useState(0);
    const [items, setItems] = useState<ItemDto[]>([]);
    const [itemToDelete, setItemToDelete] = useState<ItemDto | undefined>();

    useEffect(() => {
        void fetchGold();
        void fetchItems();
    }, []);

    const fetchGold = async () => {
        const userData = await usersClient.whoami();
        setGold(userData.data.gold);
    };

    const fetchItems = async () => {
        const itemsData = await itemsClient.getItems();
        setItems(itemsData.data);
    };

    const deleteItem = async () => {
        if (!itemToDelete) {
            return;
        }
        await itemsClient.deleteItem(itemToDelete.id);
        setItems((prev) => prev.filter((p) => p.id !== itemToDelete.id));
        setItemToDelete(undefined);
    };

    const emptySlots = useMemo(() => {
        const emptyCount = Math.max(0, GRID_SIZE - items.length);
        return Array.from({ length: emptyCount });
    }, [items]);

    const getRarityName = (rarity: string) => {
        return rarity.toLowerCase() as 'common' | 'uncommon' | 'rare' | 'unique' | 'epic' | 'mythical';
    };

    return (
        <GameWindow title="Inventory" onClose={() => setView(GameView.World)} size="lg">
            <div className={style.goldDisplay}>
                <span className={style.goldAmount}>{gold.toLocaleString()}</span>
                <span className={style.goldLabel}>Gold</span>
            </div>

            <GameGrid slotSize="56px" gap="4px">
                {items.map((item) => (
                    <GameSlot
                        key={item.id}
                        rarity={getRarityName(item.rarity)}
                        onClick={item.type !== 'Quest' ? () => setItemToDelete(item) : undefined}
                        tooltipContent={<ItemTooltip item={item} />}>
                        <div className={style.itemSlot}>
                            <ItemComponent item={item} itemStyle={{ width: '100%', height: '100%' }} />
                            {item.stackable && item.quantity > 1 && (
                                <span className={style.quantity}>{item.quantity}</span>
                            )}
                        </div>
                    </GameSlot>
                ))}
                {emptySlots.map((_, index) => (
                    <GameSlot key={`empty-${index}`} isEmpty />
                ))}
            </GameGrid>

            {itemToDelete && (
                <ConfirmModal
                    title="Discard Item"
                    onConfirm={deleteItem}
                    onCancel={() => setItemToDelete(undefined)}
                    confirmText="Discard"
                    cancelText="Keep">
                    <p>
                        Are you sure you want to discard <b>{itemToDelete.label}</b>
                        {itemToDelete.quantity > 1 ? ` (${itemToDelete.quantity})` : ''}?
                    </p>
                </ConfirmModal>
            )}
        </GameWindow>
    );
};
