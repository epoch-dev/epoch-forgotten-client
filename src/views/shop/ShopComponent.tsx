import style from './ShopComponent.module.scss';
import { NpcShopItem } from "../../common/api/.generated";
import { AssetsService } from '../../common/services/AssetsService';

const ShopComponent = ({ npcShop, onClose }: { npcShop: NpcShopItem[]; onClose: () => void }) => {
    return (
        <div className={style.shopViewOverlay}>
            <div className={style.shopView}>
                <button className={style.closeShopButton} onClick={onClose}>X</button>
                <div className={style.shopItems}>
                    {npcShop.map((shopItem, index) => (
                        <ShopItem key={index} shopItem={shopItem} />
                    ))}
                </div>
            </div>
        </div>
    );
};

const ShopItem = ({ shopItem }: { shopItem: NpcShopItem }) => {
    return (
        <div className={`${style.shopItem} ${style[shopItem.item.rarity]}`}>
            <div className={style.shopItemImageContainer}>
                <img
                    className={style.shopItemImage}
                    src={AssetsService.getItemUri(shopItem.item.imageUri)}
                    alt={shopItem.item.name}
                    draggable={false}
                />
            </div>
            <div className={style.shopItemDetails}>
                <h3>{shopItem.item.label}</h3>
                <p>{shopItem.item.description}</p>
                <p>Price: {shopItem.price}</p>
                <button className={`btn ${style.buyButton}`}>Buy</button>
            </div>
        </div>
    );
};

export default ShopComponent;
