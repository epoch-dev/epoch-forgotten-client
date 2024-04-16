import { useEffect } from 'react';
import { SceneRenderer } from './SceneRenderer';
import { ScenesService } from './ScenesService';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';

export const ScenesComponent = () => {
    const { view, setScene, setView, setEncounter, setNpc } = useGameStore();

    useEffect(() => {
        ScenesService.initialize();
        const scene = new SceneRenderer({
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
                return 'blur';
            case GameView.World:
                return '';
            default:
                return 'gone';
        }
    };

    return <section id="sceneWrapper" className={getSceneClass()}></section>;
};
