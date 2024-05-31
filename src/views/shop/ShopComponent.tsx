import style from './ShopComponent.module.scss';
import type { Item } from "../../common/api/.generated";
import { AssetsService } from '../../common/services/AssetsService';
import { useGameStore } from '../game/GameStore';
import { useEffect, useState } from 'react';
import { ToastService } from '../../common/services/ToastService';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import { ShopService } from './ShopService';

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

const ShopItem = ({ item, checkout, addToCheckout }: {
    item: Item;
    checkout: { [key: string]: number };
    addToCheckout: (itemName: string, price: number, quantity: number) => void;
}) => {

    const quantity = checkout[item.name] ?? 0;
    const buyDisabled = !item.price;
    const disabledStyle = buyDisabled ? style.disabled : '';
    const showOverlay = quantity > 0 || buyDisabled;

    const handleImageClick = () => {
        if (buyDisabled) {
            return;
        }
        addToCheckout(item.name, item.price!, quantity + 1);
    };

    const ShopItemTooltipContent = () => (
        <>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            {item.price && <p>Price: {item.price}</p>}
        </>
    );

    return (
        <TooltipComponent hint={<ShopItemTooltipContent />}>
            <div
                className={`${style.shopItem} ${style[item.rarity]} ${disabledStyle}`}
                onClick={handleImageClick}
            >
                {showOverlay && <div className={style.shopItemOverlay}>
                    {!buyDisabled ? quantity : 'Not availible'}
                </div>}
                <img
                    className={style.shopItemImage}
                    src={AssetsService.getItemUri(item.imageUri)}
                    alt={item.name}
                    draggable={false}
                />
            </div>
        </TooltipComponent>
    );
};

export default ShopComponent;
