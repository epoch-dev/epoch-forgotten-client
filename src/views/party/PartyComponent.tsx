import { useEffect, useState } from 'react';
import { CharacterDto, PartySlot } from '../../common/api/.generated';
import { charactersClient } from '../../common/api/client';
import { SoundService } from '../../common/services/SoundService';
import { GameWindow } from '../../common/ui';
import { throttle } from '../../common/utils';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { CharacterComponent } from './CharacterComponent';
import style from './PartyComponent.module.scss';

const soundService = SoundService.getInstance();

export const PartyComponent = () => {
    const { setView } = useGameStore();
    const [party, setParty] = useState<CharacterDto[]>([]);
    const [roster, setRoster] = useState<CharacterDto[]>([]);

    const main = party.find((c) => c.partySlot === 'Main');
    const first = party.find((c) => c.partySlot === 'First');
    const second = party.find((c) => c.partySlot === 'Second');
    const third = party.find((c) => c.partySlot === 'Third');

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
        soundService.toggleParty();
        setParty((p) => [{ ...character, partySlot: slot }, ...p]);
        setRoster((r) => r.filter((c) => c.id !== characterId));
    };

    const removeFromParty = async (characterId: string) => {
        const character = party.find((c) => c.id === characterId);
        if (!character || character.partySlot === PartySlot.Main) {
            return;
        }
        await charactersClient.removeFromParty({ characterId });
        soundService.toggleParty();
        setParty((p) => p.filter((c) => c.id !== characterId));
        setRoster((r) => [character, ...r]);
    };

    return (
        <GameWindow title="Party" onClose={() => setView(GameView.World)} size="lg">
            <section className={style.partySection}>
                <h3 className={style.sectionTitle}>Active Party</h3>
                <div className={style.partyGrid}>
                    {[main, first, second, third].map((character, index) =>
                        character ? (
                            <div
                                onClick={throttle(() => removeFromParty(character.id))}
                                key={character.id}>
                                <CharacterComponent character={character} />
                            </div>
                        ) : (
                            <div key={index} className={style.emptySlot}>
                                <span className={style.slotNumber}>{['I', 'II', 'III', 'IV'][index]}</span>
                            </div>
                        ),
                    )}
                </div>
            </section>

            {roster.length > 0 && (
                <section className={style.partySection}>
                    <h3 className={style.sectionTitle}>Standby</h3>
                    <div className={style.partyGrid}>
                        {roster.map((character) => (
                            <div
                                onClick={throttle(() => addToParty(character.id))}
                                key={character.id}>
                                <CharacterComponent character={character} />
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </GameWindow>
    );
};
