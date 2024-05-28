import style from './ShopComponent.module.scss';
import { Item } from "../../common/api/.generated";
import { AssetsService } from '../../common/services/AssetsService';
import { ItemsClient } from '../../common/api/client';
import { useGameStore } from '../game/GameStore';
import { useState } from 'react';
import { ToastService } from '../../common/services/ToastService';

const ShopComponent = ({ npcShop, onClose }: { npcShop: Item[]; onClose: () => void }) => {
    return (
        <div className={style.shopViewOverlay}>
            <div className={style.shopView}>
                <button className={style.closeShopButton} onClick={onClose}>X</button>
                <div className={style.shopItems}>
                    {npcShop.map((shopItem, index) => (
                        <ShopItem key={index} item={shopItem} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ShopItem = ({ item }: { item: Item }) => {
    const { npc } = useGameStore();
    const [buying, setBuying] = useState(false);

    const buyItem = async () => {
        if (!npc) {
            return;
        }
        setBuying(true);
        try {
            await ItemsClient.buyItem({ name: item.name, quantity: 1, npcName: npc.npcName });
            ToastService.success({ message: 'Item bought' })
        } catch (error) {
            ToastService.error({ message: 'Error buying item' })
        } finally {
            setBuying(false);
        }
    }

    return ( // todo: display and handle current money
        <div className={`${style.shopItem} ${style[item.rarity]}`}>
            <div className={style.shopItemImageContainer}>
                <img
                    className={style.shopItemImage}
                    src={AssetsService.getItemUri(item.imageUri)}
                    alt={item.name}
                    draggable={false}
                />
            </div>
            <div className={style.shopItemDetails}>
                <h3>{item.label}</h3>
                <p>{item.description}</p>
                <p>Price: {item.price ?? 'Not availible'}</p>
                {item.price &&
                    <button
                        className={`btn ${style.buyButton}`}
                        onClick={buyItem}
                        disabled={buying}
                    >
                        Buy
                    </button>
                }
            </div>
        </div>
    );
};

export default ShopComponent;
