import style from './GameComponent.module.scss';
import { ScenesComponent } from '../scenes/ScenesComponent';
import { GameView } from './types';
import { PartyComponent } from '../party/PartyComponent';
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
import { useYellowToast } from '../../common/hooks.ts';
import SettingsPanel from '../../common/components/SettingsPanel.tsx';
import InfoPanel from '../../common/components/InfoPanel.tsx';
import { UserRole } from '../../common/api/.generated/api.ts';
import { StorageService } from '../../common/services/StorageService.ts';
import { useGameNavigation } from './useGameNavigation';
import { HudBar } from './HudBar';

export const GameComponent = () => {
    const { view, setView, canNavigate, isImmersiveView } = useGameNavigation();
    const user = StorageService.get('user');

    useYellowToast();

    return (
        <div className={style.gameContainer}>
            {/* Game Canvas (always visible) */}
            <div className={style.canvasLayer}>
                <ScenesComponent />
            </div>

            {/* Dark overlay for non-immersive views */}
            {!isImmersiveView && <div className={style.darkOverlay} />}

            {/* View Content */}
            <div className={style.viewLayer}>
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
            </div>

            {/* HUD Bar */}
            {canNavigate && <HudBar currentView={view} onNavigate={setView} />}

            {/* Side Panel */}
            <aside className={style.asidePanel}>
                <SettingsPanel />
                <InfoPanel />
                {user?.role === UserRole.Administrator && (
                    <button onClick={() => setView(GameView._Dev)} className={style.devBtn}>
                        DEV
                    </button>
                )}
            </aside>
        </div>
    );
};
