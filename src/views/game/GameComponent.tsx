import { ScenesComponent } from '../scenes/ScenesComponent';
import { GameView } from './types';
import { PartyComponent } from '../party/PartyComponent';
import { useGameStore } from './GameStore';
import { BattleComponent } from '../battle/BattleComponent';
import DialogueComponent from '../dialogue/DialogueComponent';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../common/services/StorageService';
import { IntroComponent } from '../intro/IntroComponent';
import MuteButton from '../../common/components/MuteButton';

export const GameComponent = () => {
    const navigate = useNavigate();
    const { view, setView, clear } = useGameStore();

    const canNavigate = view !== GameView.Battle && view !== GameView.Intro;

    const handleSignout = () => {
        StorageService.clear();
        clear();
        navigate('/');
    };

    return (
        <>
            <MuteButton />
            <main className="contentWrapper">
                <ScenesComponent />
                {view === GameView.Party && <PartyComponent />}
                {view === GameView.Battle && <BattleComponent />}
                {view === GameView.Dialogue && <DialogueComponent />}
                {view === GameView.Intro && <IntroComponent />}
            </main>
            {canNavigate && (
                <nav className="navWrapper">
                    <button onClick={() => setView(GameView.World)} className="navItem">
                        World
                    </button>
                    <button onClick={() => setView(GameView.Party)} className="navItem">
                        Party
                    </button>
                    <button onClick={handleSignout} className="navItem">
                        Signout
                    </button>
                </nav>
            )}
        </>
    );
};
