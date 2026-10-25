export type ExclusiveGuard = {
    current: boolean;
};

export const runExclusive = async <T>(
    guard: ExclusiveGuard,
    operation: () => Promise<T>,
): Promise<T | undefined> => {
    if (guard.current) {
        return undefined;
    }

    guard.current = true;
    try {
        return await operation();
    } finally {
        guard.current = false;
    }
};
