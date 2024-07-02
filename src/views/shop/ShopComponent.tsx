import style from './ShopComponent.module.scss';
import type { Item } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { useEffect, useMemo, useState } from 'react';
import { ToastService } from '../../common/services/ToastService';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import { ShopService } from './ShopService';
import ShopItem from './ShopItem';
import { SoundService } from '../../common/services/SoundService';

const soundService = SoundService.getInstance();

const ShopComponent = ({ npcShop, onClose }: { npcShop: Item[]; onClose: () => void }) => {
    const { npc } = useGameStore();
    const [gold, setGold] = useState(0);
    const [totalCost, setTotalCost] = useState(0);
    const [checkout, setCheckout] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        void getGold();
    }, []);

    const getGold = async () => {
        setLoading(true);
        setGold(await ShopService.getGold());
        setLoading(false);
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
        if (!npc) {
            return;
        }
        try {
            const buyItemsDto = [];
            for (const [itemName, quantity] of Object.entries(checkout)) {
                buyItemsDto.push({ name: itemName, quantity, npcName: npc.npcName });
            }
            await ShopService.buyItems(buyItemsDto);
            setGold((prevGold) => prevGold - totalCost);
            setTotalCost(0);
            setCheckout({});
            ToastService.success({ message: 'Items bought' });
        } catch (error) {
            ToastService.error({ message: 'Error buying items' });
        }
        setLoading(false);
    };

    const handleClose = () => {
        soundService.click();
        onClose();
    };

    const buyDisabled = totalCost > gold;

    const emptyItems = useMemo(() => {
        const totalItems = npcShop.length;
        const gridSize = 16;
        const emptyItemsCount = Math.max(0, gridSize - totalItems);
        return Array.from({ length: emptyItemsCount });
    }, [npcShop]);

    return (
        <div className={style.shopViewOverlay}>
            <div className={style.shopView}>
                {loading && <LoadingOverlay />}
                <div className={style.shopItems}>
                    {npcShop.map((shopItem, index) => (
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
                            onClick={buyAll}
                            disabled={buyDisabled || !totalCost}>
                            Purchase
                        </button>
                        <button className={style.closeShopButton} onClick={handleClose}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShopComponent;
