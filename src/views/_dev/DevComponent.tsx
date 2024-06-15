import { useRef } from 'react';
import { charactersClient, itemsClient } from '../../common/api/client';
import { ToastService } from '../../common/services/ToastService';

/**
 * Bad practices allowed
 */
export const DevComponent = () => {
    const charNameRef = useRef<HTMLInputElement>(null);
    const charLevelRef = useRef<HTMLInputElement>(null);
    const itemNameRef = useRef<HTMLInputElement>(null);
    const itemQuantityRef = useRef<HTMLInputElement>(null);

    const recruitCharacter = async () => {
        await charactersClient.recruitCharacter({
            characterName: charNameRef.current!.value,
            level: +charLevelRef.current!.value,
            affinity: 0,
        });
        ToastService.success({ message: `${charNameRef.current!.value} recruited` });
    };

    const addItem = async () => {
        await itemsClient.addItem({
            name: itemNameRef.current!.value,
            quantity: +itemQuantityRef.current!.value || 1,
        });
        ToastService.success({ message: `${itemNameRef.current!.value} added` });
    };

    return (
        <>
            <section className="formWrapper">
                <b>Recruit character</b>
                <input ref={charNameRef} type="text" placeholder="name" />
                <input ref={charLevelRef} type="number" placeholder="level" />
                <button onClick={recruitCharacter}>Recruit</button>
            </section>
            <hr />
            <section className="formWrapper">
                <b>Add Item</b>
                <input ref={itemNameRef} type="text" placeholder="name" />
                <input ref={itemQuantityRef} type="number" placeholder="quantity" />
                <button onClick={addItem}>Add</button>
            </section>
        </>
    );
};
