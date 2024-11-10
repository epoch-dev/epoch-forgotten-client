import style from './ShopComponent.module.scss';
import type { Item } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { useEffect, useMemo, useState } from 'react';
import { ToastService } from '../../common/services/ToastService';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import { ShopService } from './ShopService';
import ShopItem from './ShopItem';
import { SoundService } from '../../common/services/SoundService';
import { npcsClient } from '../../common/api/client';
import { GameView } from '../game/types';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { throttle } from '../../common/utils';

const soundService = SoundService.getInstance();

const ShopBuyComponent = () => {
    const { npcName, setView } = useGameStore();
    const [shopItems, setShopItems] = useState<Item[]>([]);
    const [gold, setGold] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [checkout, setCheckout] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void fetchShop();
        void fetchGold();
    }, []);

    const fetchShop = async () => {
        if (!npcName) {
            return setView(GameView.World);
        }
        setLoading(true);
        const npcData = (await npcsClient.getNpc(npcName)).data;
        setShopItems(npcData.shop ?? []);
        setLoading(false);
    };

    const fetchGold = async () => {
        setGold(await ShopService.getGold());
    };

    const addToCheckout = (item: Item) => {
        soundService.click();
        if (checkout[item.name] >= 99) {
            return;
        }
        setTotalCost((prevCost) => prevCost + (item.price ?? 0));
        setCheckout((prevCheckout) => ({
            ...prevCheckout,
            [item.name]: (prevCheckout[item.name] ?? 0) + 1,
        }));
    };

    const removeFromCheckout = (item: Item) => {
        soundService.click();
        if (!checkout[item.name] || checkout[item.name] <= 0) {
            return;
        }
        setTotalCost((prevCost) => prevCost - (item.price ?? 0));
        setCheckout((prevCheckout) => ({
            ...prevCheckout,
            [item.name]: prevCheckout[item.name] - 1,
        }));
    };

    const buyAll = async () => {
        soundService.click();
        setLoading(true);
        if (!npcName) {
            return;
        }
        try {
            const buyItemsDto = [];
            for (const [itemName, quantity] of Object.entries(checkout)) {
                buyItemsDto.push({ name: itemName, quantity, npcName });
            }
            await ShopService.buyItems(buyItemsDto);
            setGold((prevGold) => prevGold - totalCost);
            setTotalCost(0);
            setCheckout({});
            ToastService.success({ message: 'Items bought' });
        } catch {
            ToastService.error({ message: 'Error buying items' });
        }
        setLoading(false);
    };

    const buyDisabled = totalCost > gold;

    const emptyItems = useMemo(() => {
        const totalItems = shopItems.length;
        const gridSize = 25;
        const emptyItemsCount = Math.max(0, gridSize - totalItems);
        return Array.from({ length: emptyItemsCount });
    }, [shopItems]);

    return (
        <div className={style.shopViewOverlay}>
            <div className={style.shopView}>
                {loading && <LoadingOverlay />}
                <div className={style.shopItems}>
                    {shopItems.map((shopItem, index) => (
                        <ShopItem
                            key={index}
                            item={shopItem}
                            checkout={checkout}
                            addToCheckout={addToCheckout}
                            removeFromCheckout={removeFromCheckout}
                        />
                    ))}
                    {emptyItems.map((_, index) => (
                        <div key={`empty-${index}`} className={style.shopItemEmpty} />
                    ))}
                </div>
                <div className={style.shopPanel}>
                    <div className={style.goldAmount}>
                        <p>Gold: {gold}</p>
                        <p>Total: {totalCost}</p>
                        {buyDisabled && totalCost && <p className={style.errorLabel}>Not enough gold</p>}
                    </div>
                    <div>
                        <button
                            className={style.buyButton}
                            onClick={throttle(buyAll)}
                            disabled={buyDisabled || !totalCost}>
                            Purchase
                        </button>
                        <button className={style.closeShopButton} onClick={() => setView(GameView.World)}>
                            Close
                        </button>
                    </div>
                </div>
                <button className={style.modeShopButton} onClick={() => setView(GameView.ShopSell)}>
                    <TooltipComponent hint="Sell" config={{}}>
                        <p>♻</p>
                    </TooltipComponent>
                </button>
            </div>
        </div>
    );
};

export default ShopBuyComponent;
