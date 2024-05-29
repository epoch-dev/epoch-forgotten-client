import { itemsClient, usersClient } from "../../common/api/client";

export class ShopService {
    public static async getGold() {
        const user = (await usersClient.whoami()).data;
        return user.gold;
    }

    public static async buyItem(itemName: string, npcName: string) {
        await itemsClient.buyItem({ name: itemName, quantity: 1, npcName });
    }
}
