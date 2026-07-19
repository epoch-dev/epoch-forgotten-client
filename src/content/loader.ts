import {
    buildPreviewRecoveryMessage as formatPreviewRecoveryMessage,
    describePreviewBundleErrors,
    isPreviewBundle,
    isStalePreviewBundle,
} from './guard';
import { PREVIEW_SYNC_COMMAND, type PreviewBundle } from './types';

export type PreviewBundleLoadSuccess = Readonly<{
    kind: 'loaded';
    bundle: PreviewBundle;
}>;

export type PreviewBundleLoadFailure = Readonly<{
    kind: 'missing' | 'invalid' | 'stale';
    message: string;
    syncCommand: string;
}>;

export type PreviewBundleLoadResult = PreviewBundleLoadSuccess | PreviewBundleLoadFailure;

type PreviewBundleModule = Readonly<{
    default: unknown;
}>;

type PreviewBundleImporter = () => Promise<PreviewBundleModule>;

const previewBundleModulePath = './.generated/preview-bundle.json';

const importPreviewBundle = (): Promise<PreviewBundleModule> =>
    import(/* @vite-ignore */ previewBundleModulePath) as Promise<PreviewBundleModule>;

export const buildPreviewRecoveryMessage = (
    syncCommand: string,
    errors: readonly string[] = [],
): string => formatPreviewRecoveryMessage(syncCommand, errors);

const rejectPreviewBundle = (value: unknown): PreviewBundleLoadFailure => ({
    kind: isStalePreviewBundle(value) ? 'stale' : 'invalid',
    message: buildPreviewRecoveryMessage(
        PREVIEW_SYNC_COMMAND,
        describePreviewBundleErrors(value),
    ),
    syncCommand: PREVIEW_SYNC_COMMAND,
});

export const loadPreviewBundle = async (
    importBundle: PreviewBundleImporter = importPreviewBundle,
): Promise<PreviewBundleLoadResult> => {
    try {
        const module = await importBundle();
        const candidate: unknown = module.default;
        if (!isPreviewBundle(candidate)) {
            return rejectPreviewBundle(candidate);
        }
        return {
            kind: 'loaded',
            bundle: candidate,
        };
    } catch {
        return {
            kind: 'missing',
            message: buildPreviewRecoveryMessage(PREVIEW_SYNC_COMMAND),
            syncCommand: PREVIEW_SYNC_COMMAND,
        };
    }
};

export const parsePreviewBundle = (value: unknown): PreviewBundleLoadResult => {
    if (!isPreviewBundle(value)) {
        return rejectPreviewBundle(value);
    }
    return {
        kind: 'loaded',
        bundle: value,
    };
};
