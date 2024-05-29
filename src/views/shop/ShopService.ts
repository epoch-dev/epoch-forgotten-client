import { ItemsClient, UsersClient } from "../../common/api/client";

export class ShopService {
    public static async getGold() {
        const user = (await UsersClient.whoami()).data;
        return user.gold;
    }

    public static async buyItem(itemName: string, npcName: string) {
        await ItemsClient.buyItem({ name: itemName, quantity: 1, npcName });
    }
}
