import { useEffect, useRef } from 'react';
import type { SceneProjection } from '../../content/projections';

const TILE_COLORS: Readonly<Record<string, string>> = {
    Route: '#dd1331',
    Collision: '#121212',
    SafeRoute: '#2a3d4f',
    Npc: '#3b82f6',
    Passage: '#22c55e',
    Encounter: '#f59e0b',
};

const ENTITY_COLORS: Readonly<Record<Exclude<SceneProjection['entities'][number]['kind'], 'geometry'>, string>> = {
    npc: TILE_COLORS.Npc,
    passage: TILE_COLORS.Passage,
};

const MAX_CANVAS_WIDTH = 960;

export const SceneMapPreview = ({ scene }: { scene: SceneProjection }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return;
        }
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        const worldWidth = scene.columns * scene.tileSize;
        const worldHeight = scene.rows * scene.tileSize;
        const scale = Math.min(1, MAX_CANVAS_WIDTH / worldWidth);
        canvas.width = Math.max(1, Math.floor(worldWidth * scale));
        canvas.height = Math.max(1, Math.floor(worldHeight * scale));
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#0f172a';
        context.fillRect(0, 0, canvas.width, canvas.height);

        for (const entity of scene.entities) {
            context.fillStyle =
                entity.kind === 'geometry'
                    ? (TILE_COLORS[entity.label] ?? TILE_COLORS.Route)
                    : ENTITY_COLORS[entity.kind];
            const size = scene.tileSize * scale;
            context.fillRect(entity.x * scale, entity.y * scale, Math.max(1, size), Math.max(1, size));
        }

        for (const overlay of scene.overlays) {
            context.fillStyle = TILE_COLORS.Encounter;
            const marker = Math.max(2, scene.tileSize * scale);
            context.fillRect(overlay.position.x * scale, overlay.position.y * scale, marker, marker);
        }
    }, [scene]);

    return (
        <div>
            <canvas
                ref={canvasRef}
                className="contentLabCanvas"
                role="img"
                aria-label={`Map preview of ${scene.label}`}
            />
            <p className="contentLabMeta">
                {scene.columns}x{scene.rows} grid, {scene.tileCount} tiles, {scene.overlays.length} encounter overlays
            </p>
        </div>
    );
};
