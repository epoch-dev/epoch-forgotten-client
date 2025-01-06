import style from './GameComponent.module.scss';
import { ScenesComponent } from '../scenes/ScenesComponent';
import { GameView } from './types';
import { PartyComponent } from '../party/PartyComponent';
import { useGameStore } from './GameStore';
import { BattleComponent } from '../battle/BattleComponent';
import DialogueComponent from '../dialogue/DialogueComponent';
import { IntroComponent } from '../intro/IntroComponent';
import { SkillsComponent } from '../skills/SkillsComponent';
import { DevComponent } from '../_dev/DevComponent';
import { EquipmentComponent } from '../equipment/EquipmentComponent';
import JournalComponent from '../journal/JournalComponent';
import { InventoryComponent } from '../inventory/InventoryComponent';
import ShopBuyComponent from '../shop/ShopBuyComponent';
import { ShopSellComponent } from '../shop/ShopSellComponent';
import { useEffect, useRef } from 'react';
import { battleClient, charactersClient } from '../../common/api/client';
import { useYellowToast } from '../../common/hooks.ts';
import SettingsPanel from '../../common/components/SettingsPanel.tsx';
import InfoPanel from '../../common/components/InfoPanel.tsx';
import { UserRole } from '../../common/api/.generated/api.ts';
import { StorageService } from '../../common/services/StorageService.ts';

const NOT_SCROLLABLE_VIEWS = [
    GameView.World,
    GameView.Dialogue,
    GameView.ShopBuy,
    GameView.ShopSell,
    GameView.Battle,
];

export const GameComponent = () => {
    const { view, setView } = useGameStore();
    const user = StorageService.get('user');
    const viewRef = useRef(view);

    useYellowToast();

    const canNavigate = view !== GameView.Battle && view !== GameView.Intro;
    const overflowHidden = NOT_SCROLLABLE_VIEWS.includes(view) ? { overflow: 'hidden' } : {};

    useEffect(() => {
        void checkParty();
        void checkBattle();

        document.addEventListener('keydown', handleKeyPress);

        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, []);

    useEffect(() => {
        viewRef.current = view;
    }, [view]);

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

    const handleKeyPress = (event: KeyboardEvent) => {
        const pressedKey = event.key;
        if (pressedKey !== 'Escape' && pressedKey !== 'Backspace') {
            return;
        }
        switch (viewRef.current) {
            case GameView.Equipment:
            case GameView.Skills:
                setView(GameView.Party);
                break;
            case GameView.Party:
            case GameView.Inventory:
            case GameView.Journal:
            case GameView.ShopBuy:
            case GameView.ShopSell:
                setView(GameView.World);
                break;
        }
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
                </nav>
            )}
            <aside className={style.asidePanel}>
                <SettingsPanel />
                <InfoPanel />
                {user?.role === UserRole.Administrator && (
                    <button onClick={() => setView(GameView._Dev)} className="panelBtn">
                        _Dev
                    </button>
                )}
            </aside>
        </>
    );
};
