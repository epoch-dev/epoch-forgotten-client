import { ItemBuyDto } from '../../common/api/.generated';
import { itemsClient, usersClient } from '../../common/api/client';

export class ShopService {
    public static async getGold() {
        const user = (await usersClient.whoami()).data;
        return user.gold;
    }

    public static async buyItems(dto: ItemBuyDto[]) {
        await itemsClient.buyItems(dto);
    }
}
