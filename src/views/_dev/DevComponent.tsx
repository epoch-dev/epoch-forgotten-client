import { useRef } from 'react';
import { CharactersClient } from '../../common/api/client';
import { ToastService } from '../../common/services/ToastService';

/**
 * Bad practices allowed
 */
export const DevComponent = () => {
    const charNameRef = useRef<HTMLInputElement>(null);
    const charLevelRef = useRef<HTMLInputElement>(null);

    const recruitCharacter = async () => {
        await CharactersClient.recruitCharacter({
            characterName: charNameRef.current!.value,
            level: +charLevelRef.current!.value,
            affinity: 0,
        });
        ToastService.success({ message: `${charNameRef.current!.value} recruited` });
    };

    return (
        <>
            <section className="formWrapper">
                <b>Recruit character</b>
                <input ref={charNameRef} type="text" placeholder="name" />
                <input ref={charLevelRef} type="number" placeholder="level" />
                <button onClick={recruitCharacter}>Recruit</button>
            </section>
        </>
    );
};
