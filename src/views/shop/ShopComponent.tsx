import style from './ShopComponent.module.scss';
import { Item } from "../../common/api/.generated";
import { AssetsService } from '../../common/services/AssetsService';
import { ItemsClient, UsersClient } from '../../common/api/client';
import { useGameStore } from '../game/GameStore';
import { useEffect, useState } from 'react';
import { ToastService } from '../../common/services/ToastService';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import LoadingOverlay from '../../common/components/LoadingOverlay';

const ShopComponent = ({ npcShop, onClose }: { npcShop: Item[]; onClose: () => void }) => {
    const [gold, setGold] = useState(0);

    useEffect(() => {
        void getGold();
    }, []);

    const getGold = async () => {
        const user = (await UsersClient.whoami()).data;
        setGold(user.gold);
    };

    return (
        <div className={style.shopViewOverlay}>
            <div className={style.shopView}>
                <button className={style.closeShopButton} onClick={onClose}>x</button>
                <div className={style.shopHeader}>
                    <div className={style.goldAmount}>Gold: {gold}</div>
                </div>
                <div className={style.shopItems}>
                    {npcShop.map((shopItem, index) => (
                        <ShopItem key={index} item={shopItem} gold={gold} updateGold={getGold} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ShopItem = ({ item, gold, updateGold }: { item: Item; gold: number; updateGold: () => Promise<void> }) => {
    const { npc } = useGameStore();
    const [buying, setBuying] = useState(false);

    const buyItem = async () => {
        if (!npc) {
            return;
        }
        setBuying(true);
        try {
            await ItemsClient.buyItem({ name: item.name, quantity: 1, npcName: npc.npcName });
            await updateGold();
            ToastService.success({ message: 'Item bought' })
        } catch (error) {
            ToastService.error({ message: 'Error buying item' })
        } finally {
            setBuying(false);
        }
    }

    const hasEnoughGold = item.price && gold >= item.price;
    const buyDisabled = buying || !item.price || !hasEnoughGold;

    const ShopItemTooltipContent = () => (
        <>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            {item.price && <p>Price: {item.price}</p>}
        </>
    );

    return (
        <TooltipComponent hint={<ShopItemTooltipContent />}>
            <div className={`${style.shopItem} ${style[item.rarity]}`}>
                {buying && <LoadingOverlay />}
                <img
                    className={style.shopItemImage}
                    src={AssetsService.getItemUri(item.imageUri)}
                    alt={item.name}
                    draggable={false}
                />
                <button
                    className={`btn ${style.buyButton}`}
                    onClick={buyItem}
                    disabled={buyDisabled}
                >
                    {item.price ? hasEnoughGold ? 'Buy' : 'Not enough gold' : 'Not availible'}
                </button>
            </div>
        </TooltipComponent>
    );
};

export default ShopComponent;
