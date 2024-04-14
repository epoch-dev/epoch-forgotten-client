import style from './MapsComponent.module.scss';
import { useEffect } from 'react';
import { MapScene } from './MapScene';
import { MapsService } from './MapsService';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';

export const MapsComponent = () => {
    const { view, setScene, setView, setEncounter, setNpc } = useGameStore();

    useEffect(() => {
        MapsService.initialize();
        const scene = new MapScene({
            onEncounter: (encounter) => {
                setView(GameView.Battle);
                setEncounter(encounter);
            },
            onNpc: (npc) => {
                setView(GameView.Dialogue);
                setNpc(npc);
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

    const getSceneClass = () => {
        switch (view) {
            case GameView.Dialogue:
                return style.blur;
            case GameView.World:
                return '';
            default:
                return 'gone';
        }
    };

    return <section id="sceneWrapper" className={getSceneClass()}></section>;
};
