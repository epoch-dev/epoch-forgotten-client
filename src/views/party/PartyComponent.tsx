import { useEffect, useState } from 'react';
import { CharacterDto } from '../../common/api/.generated';
import { CharactersClient } from '../../common/api/client';

export const PartyComponent = () => {
    const [party, setParty] = useState<CharacterDto[]>([]);

    useEffect(() => {
        void setupParty();
    }, []);

    const setupParty = async () => {
        const partyData = (await CharactersClient.getParty()).data;
        setParty(partyData);
    };

    // dev only
    const addToParty = async () => {
        await CharactersClient.recruitCharacter({
            characterName: 'character-story-1',
            level: 13,
            affinity: 2,
        });
        await setupParty();
    };

    return (
        <>
            Party Component
            {party.map((character) => (
                <li key={character.id}>
                    {character.name} ({character.level})
                </li>
            ))}
            <hr />
            {/* TODO - remove, dev only */}
            <button onClick={addToParty}>Extend</button>
        </>
    );
};
