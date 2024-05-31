import style from './ShopComponent.module.scss';
import { TooltipComponent } from "../../common/components/TooltipComponent";
import type { Item } from '../../common/api/.generated';
import { AssetsService } from '../../common/services/AssetsService';

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

export default ShopItem;
