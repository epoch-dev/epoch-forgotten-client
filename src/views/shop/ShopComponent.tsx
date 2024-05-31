import style from './ShopComponent.module.scss';
import type { Item } from "../../common/api/.generated";
import { useGameStore } from '../game/GameStore';
import { useEffect, useState } from 'react';
import { ToastService } from '../../common/services/ToastService';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import { ShopService } from './ShopService';
import ShopItem from './ShopItem';

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

    const addToCheckout = (itemName: string, price: number, quantity: number) => {
        setTotalCost(prevCost => prevCost + price);
        setCheckout(prevCheckout => ({
            ...prevCheckout,
            [itemName]: quantity,
        }));
    };

    const buyAll = async () => {
        setLoading(true);
        if (!npc) {
            return;
        }
        try {
            const buyItemsDto = [];
            for (const [itemName, quantity] of Object.entries(checkout)) {
                buyItemsDto.push({ name: itemName, quantity, npcName: npc.npcName })
            }
            await ShopService.buyItems(buyItemsDto);
            setGold(prevGold => prevGold - totalCost);
            setTotalCost(0);
            setCheckout({});
            ToastService.success({ message: 'Items bought' });
        } catch (error) {
            ToastService.error({ message: 'Error buying items' });
        }
        setLoading(false);
    };

    const buyDisabled = totalCost > gold;

    return (
        <div className={style.shopViewOverlay}>
            <div className={style.shopView}>
                {loading && <LoadingOverlay />}
                <button className={style.closeShopButton} onClick={onClose}>x</button>
                <div className={style.shopItems}>
                    {npcShop.map((shopItem, index) => (
                        <ShopItem
                            key={index}
                            item={shopItem}
                            checkout={checkout}
                            addToCheckout={addToCheckout}
                        />
                    ))}
                </div>
                <div className={style.shopPanel}>
                    <button
                        className={style.buyButton}
                        onClick={buyAll}
                        disabled={buyDisabled || !totalCost}
                    >
                        {!buyDisabled ? `Buy (${totalCost})` : 'Not enough gold'}
                    </button>
                    <div className={style.goldAmount}>Gold: {gold}</div>
                </div>
            </div>
        </div>
    );
};

export default ShopComponent;
