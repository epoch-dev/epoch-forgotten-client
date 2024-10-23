import style from './InventoryComponent.module.scss';
import { useEffect, useMemo, useState } from 'react';
import { itemsClient, usersClient } from '../../common/api/client';
import { ItemDto } from '../../common/api/.generated';
import { ItemComponent } from '../equipment/ItemComponent';
import { ConfirmDialog } from '../../common/components/ConfirmDialog';

export const InventoryComponent = () => {
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

    const emptyItems = useMemo(() => {
        const totalItems = items.length;
        const gridSize = 98;
        const emptyItemsCount = Math.max(0, gridSize - totalItems);
        return Array.from({ length: emptyItemsCount });
    }, [items]);

    return (
        <section>
            <div className={style.goldLabel}>
                <b>{gold}</b> Gold
            </div>
            <div className={style.itemsWrapper}>
                {items.map((item) => (
                    <div key={item.id} className={style.item}>
                        <ItemComponent item={item} />
                        {item.stackable && <div className={style.quantityLabel}>{item.quantity}</div>}
                        {item.type !== 'Quest' && <div onClick={() => setItemToDelete(item)} className={style.deleteLabel}>
                            X
                        </div>}
                    </div>
                ))}
                {emptyItems.map((_, index) => (
                    <div key={index} className={style.item}>
                        {' '}
                    </div>
                ))}
            </div>
            {itemToDelete && (
                <ConfirmDialog onConfirm={() => deleteItem()} onCancel={() => setItemToDelete(undefined)}>
                    Are you sure you want to discard <b>{itemToDelete.label}</b>
                    {itemToDelete.quantity > 1 ? ` (${itemToDelete.quantity})` : ''}?
                </ConfirmDialog>
            )}
        </section>
    );
};
