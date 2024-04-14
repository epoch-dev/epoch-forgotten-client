import { useEffect } from 'react';
import { MapScene } from './MapScene';
import { MapsService } from './MapsService';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';

export const MapsComponent = () => {
    const { view, setScene, setView, setEncounter } = useGameStore();

    useEffect(() => {
        MapsService.initialize();
        const scene = new MapScene({
            onStartBattle: (encounter) => {
                setView(GameView.Battle);
                setEncounter(encounter);
            },
        });
        const game = new Phaser.Game({
            width: 1100,
            height: 600,
            scene: scene,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { x: 0, y: 0 },
                    debug: true,
                },
            },
            parent: 'sceneWrapper',
        });
        setScene(scene);
        return () => {
            game.destroy(true);
        };
    }, []);

    return <section id="sceneWrapper" className={view !== GameView.World ? 'gone' : ''}></section>;
};
