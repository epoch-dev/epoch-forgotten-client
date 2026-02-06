import { ReactNode } from 'react';
import { LuCompass, LuUsers, LuBackpack, LuScrollText } from 'react-icons/lu';
import { GameView } from './types';
import style from './GameComponent.module.scss';

type HudBarProps = {
    currentView: GameView;
    onNavigate: (view: GameView) => void;
};

export const HudBar = ({ currentView, onNavigate }: HudBarProps) => (
    <nav className={style.hudBar}>
        <HudButton
            icon={<LuCompass />}
            label="World"
            active={currentView === GameView.World}
            onClick={() => onNavigate(GameView.World)}
        />
        <HudButton
            icon={<LuUsers />}
            label="Party"
            active={currentView === GameView.Party}
            onClick={() => onNavigate(GameView.Party)}
        />
        <HudButton
            icon={<LuBackpack />}
            label="Inventory"
            active={currentView === GameView.Inventory}
            onClick={() => onNavigate(GameView.Inventory)}
        />
        <HudButton
            icon={<LuScrollText />}
            label="Journal"
            active={currentView === GameView.Journal}
            onClick={() => onNavigate(GameView.Journal)}
        />
    </nav>
);

type HudButtonProps = {
    icon: ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
};

const HudButton = ({ icon, label, active, onClick }: HudButtonProps) => (
    <button
        className={`${style.hudButton} ${active ? style.active : ''}`}
        onClick={onClick}
        title={label}>
        <span className={style.hudIcon}>{icon}</span>
        <span className={style.hudLabel}>{label}</span>
    </button>
);
