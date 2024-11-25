import style from './GameComponent.module.scss';
import { ScenesComponent } from '../scenes/ScenesComponent';
import { GameView } from './types';
import { PartyComponent } from '../party/PartyComponent';
import { useGameStore } from './GameStore';
import { BattleComponent } from '../battle/BattleComponent';
import DialogueComponent from '../dialogue/DialogueComponent';
import { StorageService } from '../../common/services/StorageService';
import { IntroComponent } from '../intro/IntroComponent';
import { SkillsComponent } from '../skills/SkillsComponent';
import { DevComponent } from '../_dev/DevComponent';
import { EquipmentComponent } from '../equipment/EquipmentComponent';
import JournalComponent from '../journal/JournalComponent';
import MusicPanel from '../../common/components/MusicPanel';
import { InventoryComponent } from '../inventory/InventoryComponent';
import ShopBuyComponent from '../shop/ShopBuyComponent';
import { ShopSellComponent } from '../shop/ShopSellComponent';
import { useEffect } from 'react';
import { battleClient, charactersClient } from '../../common/api/client';
import { UserRole } from '../../common/api/.generated';
import InfoPanel from '../../common/components/InfoPanel';
import { appConfig } from '../../common/config.ts';
import { signout } from '../../common/utils.ts';
import { useYellowToast } from '../../common/hooks.ts';

const NOT_SCROLLABLE_VIEWS = [
    GameView.World,
    GameView.Dialogue,
    GameView.ShopBuy,
    GameView.ShopSell,
    GameView.Battle,
];

export const GameComponent = () => {
    const { view, setView } = useGameStore();
    useYellowToast();

    const user = StorageService.get('user');

    const canNavigate = view !== GameView.Battle && view !== GameView.Intro;
    const overflowHidden = NOT_SCROLLABLE_VIEWS.includes(view) ? { overflow: 'hidden' } : {};

    useEffect(() => {
        void checkParty();
        void checkBattle();
    }, []);

    const checkParty = async () => {
        const party = await charactersClient.getParty();
        if (!party.data.length) {
            setView(GameView.Intro);
        }
    };

    const checkBattle = async () => {
        const battle = await battleClient.loadBattle();
        if (!battle.data.finished) {
            setView(GameView.Battle);
        }
    };

    const handleReportIssue = () => {
        window.open(appConfig.reportIssueLink, '_blank', 'noopener,noreferrer');
    };

    const AsidePanel = () => (
        <aside className={style.asidePanel}>
            <MusicPanel />
            <InfoPanel />
            <button className="panelBtn" onClick={handleReportIssue}>
                Report issue
            </button>
            {user?.role === UserRole.Administrator && (
                <button onClick={() => setView(GameView._Dev)} className="panelBtn">
                    _Dev
                </button>
            )}
        </aside>
    );

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
                {view === GameView.Inventory && <InventoryComponent />}
                {view === GameView.ShopBuy && <ShopBuyComponent />}
                {view === GameView.ShopSell && <ShopSellComponent />}
            </main>
            {canNavigate && (
                <nav className={style.navWrapper}>
                    <button onClick={() => setView(GameView.World)} className={style.navItem}>
                        World
                    </button>
                    <button onClick={() => setView(GameView.Party)} className={style.navItem}>
                        Party
                    </button>
                    <button onClick={() => setView(GameView.Inventory)} className={style.navItem}>
                        Inventory
                    </button>
                    <button onClick={() => setView(GameView.Journal)} className={style.navItem}>
                        Journal
                    </button>
                    <button onClick={signout} className={style.navItem}>
                        Signout
                    </button>
                </nav>
            )}
            <AsidePanel />
        </>
    );
};
