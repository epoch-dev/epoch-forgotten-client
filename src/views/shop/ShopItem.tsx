import style from './ShopItem.module.scss';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import type { Item } from '../../common/api/.generated';
import { AssetsService } from '../../common/services/AssetsService';

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

    const ShopItemTooltipContent = () => (
        <>
            <h3>{item.label}</h3>
            <p>{item.description}</p>
            {item.price && <p>Price: {item.price}</p>}
        </>
    );

    return (
        <TooltipComponent hint={<ShopItemTooltipContent />}>
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
                <img src={AssetsService.getItemUri(item.imageUri)} alt={item.name} draggable={false} />
                {quantity > 0 && <div className={style.quantityLabel}>{quantity}</div>}
            </div>
        </TooltipComponent>
    );
};

export default ShopItem;
