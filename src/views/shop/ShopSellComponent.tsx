import { useEffect, useState } from 'react';
import style from './ShopComponent.module.scss';
import { ItemDto, ItemSellDtoItemsInner } from '../../common/api/.generated';
import { itemsClient, npcsClient } from '../../common/api/client';
import { useGameStore } from '../game/GameStore';
import { SoundService } from '../../common/services/SoundService';
import { GameView } from '../game/types';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { ItemTooltip } from '../equipment/ItemComponent';
import { ToastService } from '../../common/services/ToastService';
import { throttle } from '../../common/utils';
import { ShopService } from './ShopService';

const soundService = SoundService.getInstance();

export const ShopSellComponent = () => {
    const { npcName, setView } = useGameStore();
    const [purchaseFactor, setPurchaseFactor] = useState(0);
    const [userItems, setUserItems] = useState<ItemDto[]>([]);
    const [gold, setGold] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const [checkout, setCheckout] = useState<{ [key: string]: number }>({});

    useEffect(() => {
        void fetchMerchant();
        void fetchItems();
        void fetchGold();
    }, []);

    const fetchMerchant = async () => {
        if (!npcName) {
            return;
        }
        const merchantData = await npcsClient.getNpc(npcName);
        setPurchaseFactor(merchantData.data.purchaseFactor ?? 0);
    };

    const fetchItems = async () => {
        const items = await itemsClient.getItems();
        setUserItems(items.data.filter((item) => item.price !== undefined));
    };

    const fetchGold = async () => {
        setGold(await ShopService.getGold());
    };

    const addToCheckout = (item: ItemDto) => {
        soundService.click();
        if (checkout[item.id] >= item.quantity) {
            return;
        }
        setTotalPrice((prevCost) => prevCost + (item.price ?? 0));
        setCheckout((prevCheckout) => ({
            ...prevCheckout,
            [item.id]: (prevCheckout[item.id] ?? 0) + 1,
        }));
    };

    const removeFromCheckout = (item: ItemDto) => {
        soundService.click();
        if (!checkout[item.id] || checkout[item.id] <= 0) {
            return;
        }
        setTotalPrice((prevCost) => prevCost - (item.price ?? 0));
        setCheckout((prevCheckout) => ({
            ...prevCheckout,
            [item.id]: prevCheckout[item.id] - 1,
        }));
    };

    const sellAll = async () => {
        if (!npcName) {
            return;
        }
        const items: ItemSellDtoItemsInner[] = Object.keys(checkout)
            .map((itemId) => ({ id: itemId, quantity: checkout[itemId] }))
            .filter((item) => item.quantity > 0);
        await itemsClient.sellItems({ npcName, items });
        await fetchItems();
        setGold((prevGold) => prevGold + totalFactored);
        setTotalPrice(0);
        setCheckout({});
        ToastService.success({ message: 'Items sold' });
    };

    const totalFactored = Math.round(purchaseFactor * totalPrice);

    return (
        <div className={style.shopViewOverlay}>
            <div className={style.shopView}>
                <div className={style.userItems}>
                    {userItems.map((item) => (
                        <div key={item.id} className={style.userItem}>
                            <TooltipComponent
                                hint={<ItemTooltip item={item} showPrice={true} />}
                                config={{ width: '16rem' }}>
                                <p>
                                    {item.label} {item.stackable && ` (${item.quantity})`} |
                                    <b> {checkout[item.id] ? checkout[item.id] : '-'}</b>
                                </p>
                            </TooltipComponent>
                            <div className="flex">
                                <div
                                    onClick={() => removeFromCheckout(item)}
                                    className={style.userItemAction}>
                                    −
                                </div>
                                <div onClick={() => addToCheckout(item)} className={style.userItemAction}>
                                    +
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className={style.shopPanel}>
                    <div className={style.goldAmount}>
                        <p>Gold: {gold}</p>
                        <p>Purchase price: {100 * purchaseFactor}%</p>
                        <p>Total: {totalFactored}</p>
                    </div>
                    <div>
                        <button
                            className={style.buyButton}
                            onClick={throttle(sellAll)}
                            disabled={!totalPrice}>
                            Sell
                        </button>
                        <button className={style.closeShopButton} onClick={() => setView(GameView.World)}>
                            Close
                        </button>
                    </div>
                </div>
                <button className={style.modeShopButton} onClick={() => setView(GameView.ShopBuy)}>
                    <TooltipComponent hint="Purchase" config={{}}>
                        <p>♻</p>
                    </TooltipComponent>
                </button>
            </div>
        </div>
    );
};
