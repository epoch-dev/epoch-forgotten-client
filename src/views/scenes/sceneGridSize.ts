export const getSceneGridPixelSize = ({
    columns,
    rows,
    tileSize,
}: Readonly<{
    columns: number;
    rows: number;
    tileSize: number;
}>): Readonly<{ width: number; height: number }> => ({
    width: columns * tileSize,
    height: rows * tileSize,
});
