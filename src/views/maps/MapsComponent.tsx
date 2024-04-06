import { useEffect, useState } from 'react';
import { MapScene } from './MapScene';
import { MapsService } from './MapsService';

export const MapsComponent = () => {
    const [, setMapScene] = useState<MapScene | undefined>();

    useEffect(() => {
        MapsService.initialize();
        const scene = new MapScene();
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
        setMapScene(scene);
        return () => {
            game.destroy(true);
        };
    }, []);

    return <section id="sceneWrapper"></section>;
};
