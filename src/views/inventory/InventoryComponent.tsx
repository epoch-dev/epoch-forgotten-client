import style from './InventoryComponent.module.scss';
import { useEffect, useState } from 'react';
import { itemsClient, usersClient } from '../../common/api/client';
import { ItemDto } from '../../common/api/.generated';
import { ItemComponent } from '../equipment/ItemComponent';

export const InventoryComponent = () => {
    const [gold, setGold] = useState(0);
    const [items, setItems] = useState<ItemDto[]>([]);

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

    return (
        <section>
            <div className="subtitle dark bold">
                Gold: <b>{gold}</b>
            </div>
            <div className={style.itemsWrapper}>
                {items.map((item) => (
                    <div key={item.id} className={style.item}>
                        <ItemComponent item={item} />
                        {item.quantity > 1 && <div className={style.quantityLabel}>{item.quantity}</div>}
                    </div>
                ))}
            </div>
        </section>
    );
};
