import { describePreviewBundleErrors, isStalePreviewBundle } from './guard';
import { PREVIEW_SYNC_COMMAND, type PreviewBundle } from './types';

export type PreviewBundleLoadResult =
    | Readonly<{ kind: 'loaded'; bundle: PreviewBundle }>
    | Readonly<{ kind: 'missing' | 'invalid' | 'stale'; message: string; syncCommand: string }>;

type PreviewBundleImporter = () => Promise<Readonly<{ default: unknown }>>;

const previewBundleModulePath = './.generated/preview-bundle.json';

const importPreviewBundle: PreviewBundleImporter = () => import(/* @vite-ignore */ previewBundleModulePath);

export const buildPreviewRecoveryMessage = (errors: readonly string[] = []): string => {
    const detail = errors.length > 0 ? ` ${errors[0]}` : '';
    return `Preview bundle missing or stale.${detail} From epoch-forgotten run: ${PREVIEW_SYNC_COMMAND}`;
};

export const parsePreviewBundle = (value: unknown): PreviewBundleLoadResult => {
    const errors = describePreviewBundleErrors(value);
    if (errors.length === 0) {
        return { kind: 'loaded', bundle: value as PreviewBundle };
    }
    return {
        kind: isStalePreviewBundle(value) ? 'stale' : 'invalid',
        message: buildPreviewRecoveryMessage(errors),
        syncCommand: PREVIEW_SYNC_COMMAND,
    };
};

export const loadPreviewBundle = (
    importBundle: PreviewBundleImporter = importPreviewBundle,
): Promise<PreviewBundleLoadResult> =>
    importBundle().then(
        (module) => parsePreviewBundle(module.default),
        (error: unknown) => {
            console.warn('Preview bundle could not be imported', error);
            return { kind: 'missing', message: buildPreviewRecoveryMessage(), syncCommand: PREVIEW_SYNC_COMMAND };
        },
    );
