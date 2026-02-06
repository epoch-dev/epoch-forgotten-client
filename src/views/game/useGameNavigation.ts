import { useEffect, useRef } from 'react';
import { battleClient, charactersClient } from '../../common/api/client';
import { useGameStore } from './GameStore';
import { GameView } from './types';

const IMMERSIVE_VIEWS = [
    GameView.World,
    GameView.Battle,
    GameView.Dialogue,
    GameView.ShopBuy,
    GameView.ShopSell,
    GameView.Intro,
];

export const useGameNavigation = () => {
    const { view, setView } = useGameStore();
    const viewRef = useRef(view);

    const canNavigate = view !== GameView.Battle && view !== GameView.Intro;
    const isImmersiveView = IMMERSIVE_VIEWS.includes(view);

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

    return {
        view,
        setView,
        canNavigate,
        isImmersiveView,
    };
};
