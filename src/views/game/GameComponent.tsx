import { MapsComponent } from '../maps/MapsComponent';
import { GameView } from './types';
import { PartyComponent } from '../party/PartyComponent';
import { useGameStore } from './GameStore';
import { BattleComponent } from '../battle/BattleComponent';
import DialogueComponent from '../dialogue/DialogueComponent';

export const GameComponent = () => {
    const { view, setView } = useGameStore();

    return (
        <>
            <main className="contentWrapper">
                <MapsComponent />
                {view === GameView.Party && <PartyComponent />}
                {view === GameView.Battle && <BattleComponent />}
                {view === GameView.Dialogue && <DialogueComponent />}
            </main>
            {view !== GameView.Battle && (
                <nav className="navWrapper">
                    <button onClick={() => setView(GameView.World)} className="navItem">
                        World
                    </button>
                    <button onClick={() => setView(GameView.Party)} className="navItem">
                        Party
                    </button>
                </nav>
            )}
        </>
    );
};
