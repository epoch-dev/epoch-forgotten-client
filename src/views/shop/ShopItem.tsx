import style from './ShopItem.module.scss';
import type { Item } from '../../common/api/.generated';
import { ItemComponent } from '../equipment/ItemComponent';

const ShopItem = ({
    item,
    checkout,
    addToCheckout,
    removeFromCheckout,
}: {
    item: Item;
    checkout: { [key: string]: number };
    addToCheckout: (item: Item) => void;
    removeFromCheckout: (item: Item) => void;
}) => {
    const quantity = checkout[item.name] ?? 0;
    const buyDisabled = !item.price;
    const disabledStyle = buyDisabled ? style.disabled : '';

    return (
        <div className={`${style.shopItem} ${style[item.rarity]} ${disabledStyle}`}>
            {buyDisabled && <div className={style.shopItemOverlay}>Not Available</div>}
            {!buyDisabled && (
                <div
                    onClick={() => addToCheckout(item)}
                    className={style.actionIcon}
                    style={{ top: '0.1rem', left: '0.4rem' }}>
                    ▲
                </div>
            )}
            {!buyDisabled && (
                <div
                    onClick={() => removeFromCheckout(item)}
                    className={style.actionIcon}
                    style={{ top: '1.2rem', left: '0.4rem' }}>
                    ▼
                </div>
            )}
            <ItemComponent item={item} isShopItem={true} itemStyle={{ width: '6rem', height: '6rem', borderRadius: '1rem' }} />
            {quantity > 0 && <div className={style.quantityLabel}>{quantity}</div>}
        </div>
    );
};

export default ShopItem;
