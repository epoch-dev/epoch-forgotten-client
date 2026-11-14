import {
    buyItems,
    ItemBuyDto,
    whoami,
} from '../../common/api/.generated';

export class ShopService {
    public static async getGold() {
        const user = await whoami();
        return user.gold;
    }

    public static async buyItems(dto: ItemBuyDto[]) {
        await buyItems(dto);
    }
}
