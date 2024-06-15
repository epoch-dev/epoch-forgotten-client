import style from './GameComponent.module.scss';
import { ScenesComponent } from '../scenes/ScenesComponent';
import { GameView } from './types';
import { PartyComponent } from '../party/PartyComponent';
import { useGameStore } from './GameStore';
import { BattleComponent } from '../battle/BattleComponent';
import DialogueComponent from '../dialogue/DialogueComponent';
import { useNavigate } from 'react-router-dom';
import { StorageService } from '../../common/services/StorageService';
import { IntroComponent } from '../intro/IntroComponent';
import { SkillsComponent } from '../skills/SkillsComponent';
import { DevComponent } from '../_dev/DevComponent';
import { EquipmentComponent } from '../equipment/EquipmentComponent';
import JournalComponent from '../journal/JournalComponent';
import { MusicService } from '../../common/services/MusicService';
import MusicPanel from '../../common/components/MusicPanel';

export const GameComponent = () => {
    const navigate = useNavigate();
    const { view, setView, clear } = useGameStore();

    const musicService = MusicService.getInstance();
    const canNavigate = view !== GameView.Battle && view !== GameView.Intro;
    const overflowHidden =
        view === GameView.World || view === GameView.Dialogue ? { overflow: 'hidden' } : {};

    const handleSignout = () => {
        StorageService.clear();
        clear();
        navigate('/');
        musicService.stopCurrent();
    };

    return (
        <>
            <main className={style.contentWrapper} style={{ ...overflowHidden }}>
                <ScenesComponent />
                {view === GameView._Dev && <DevComponent />}
                {view === GameView.Party && <PartyComponent />}
                {view === GameView.Skills && <SkillsComponent />}
                {view === GameView.Equipment && <EquipmentComponent />}
                {view === GameView.Battle && <BattleComponent />}
                {view === GameView.Dialogue && <DialogueComponent />}
                {view === GameView.Intro && <IntroComponent />}
                {view === GameView.Journal && <JournalComponent />}
            </main>
            {canNavigate && (
                <nav className={style.navWrapper}>
                    <button onClick={() => setView(GameView.World)} className={style.navItem}>
                        World
                    </button>
                    <button onClick={() => setView(GameView.Party)} className={style.navItem}>
                        Party
                    </button>
                    <button onClick={() => setView(GameView.Journal)} className={style.navItem}>
                        Journal
                    </button>
                    <button onClick={handleSignout} className={style.navItem}>
                        Signout
                    </button>
                </nav>
            )}
            <aside>
                <MusicPanel />
                <button onClick={() => setView(GameView._Dev)} className={style.navItemDev}>
                    _Dev
                </button>
            </aside>
        </>
    );
};
