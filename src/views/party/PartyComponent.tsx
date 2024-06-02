import style from './PartyComponent.module.scss';
import { useEffect, useState } from 'react';
import { CharacterDto, PartySlot } from '../../common/api/.generated';
import { charactersClient } from '../../common/api/client';
import { CharacterComponent } from './CharacterComponent';
import { SoundService } from '../../common/services/SoundService';

export const PartyComponent = () => {
    const [party, setParty] = useState<CharacterDto[]>([]);
    const [roster, setRoster] = useState<CharacterDto[]>([]);

    const soundService = SoundService.getInstance();

    useEffect(() => {
        void setupParty();
    }, []);

    const setupParty = async () => {
        const rosterData = (await charactersClient.getRoster()).data;
        setRoster(rosterData.filter((c) => c.partySlot === PartySlot.None));
        setParty(rosterData.filter((c) => c.partySlot !== PartySlot.None));
    };

    const addToParty = async (characterId: string) => {
        const character = roster.find((c) => c.id === characterId);
        if (!character || party.length >= 3) {
            return;
        }
        let slot: PartySlot = PartySlot.None;
        if (!party.some((c) => c.partySlot === PartySlot.First)) {
            slot = PartySlot.First;
        } else if (!party.some((c) => c.partySlot === PartySlot.Second)) {
            slot = PartySlot.Second;
        } else if (!party.some((c) => c.partySlot === PartySlot.Third)) {
            slot = PartySlot.Third;
        } else {
            return;
        }
        await charactersClient.addToParty({ characterId, slot });
        soundService.partyAdd();
        setParty((p) => [{ ...character, partySlot: slot }, ...p]);
        setRoster((r) => r.filter((c) => c.id !== characterId));
    };

    const removeFromParty = async (characterId: string) => {
        const character = party.find((c) => c.id === characterId);
        if (!character) {
            return;
        }
        await charactersClient.removeFromParty({ characterId });
        soundService.partyRemove();
        setParty((p) => p.filter((c) => c.id !== characterId));
        setRoster((r) => [character, ...r]);
    };

    return (
        <section>
            <h2 className="subtitle dark">Active</h2>
            <div className={style.partyWrapper}>
                {party.map((character) => (
                    <div
                        onClick={() => removeFromParty(character.id)}
                        key={character.id}
                        className={style.characterItem}>
                        <CharacterComponent character={character} />
                    </div>
                ))}
            </div>
            <h2 className="subtitle dark">Roster</h2>
            <div className={style.partyWrapper}>
                {roster.map((character) => (
                    <div
                        onClick={() => addToParty(character.id)}
                        key={character.id}
                        className={style.characterItem}>
                        <CharacterComponent character={character} />
                    </div>
                ))}
            </div>
        </section>
    );
};
