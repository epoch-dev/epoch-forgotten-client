import { useState } from 'react';
import { MapsComponent } from '../maps/MapsComponent';
import { GameView } from './types';
import { PartyComponent } from '../party/PartyComponent';

export const GameComponent = () => {
    const [view, setView] = useState(GameView.World);

    return (
        <>
            <main>
                {view === GameView.World && <MapsComponent />}
                {view === GameView.Party && <PartyComponent />}
            </main>
            <nav>
                <button onClick={() => setView(GameView.World)}>World</button>
                <button onClick={() => setView(GameView.Party)}>Party</button>
            </nav>
        </>
    );
};
