export const runExclusive = async (
    guard: { current: boolean },
    operation: () => Promise<void>,
): Promise<void> => {
    if (guard.current) {
        return;
    }
    guard.current = true;
    try {
        await operation();
    } finally {
        guard.current = false;
    }
};
