import { useState } from 'react';
import { MapsComponent } from '../maps/MapsComponent';
import { GameView } from './types';
import { PartyComponent } from '../party/PartyComponent';

export const GameComponent = () => {
    const [view, setView] = useState(GameView.World);

    return (
        <>
            <main className='contentWrapper'>
                {view === GameView.World && <MapsComponent />}
                {view === GameView.Party && <PartyComponent />}
            </main>
            <nav className='navWrapper'>
                <button onClick={() => setView(GameView.World)} className='navItem'>World</button>
                <button onClick={() => setView(GameView.Party)} className='navItem'>Party</button>
            </nav>
        </>
    );
};
