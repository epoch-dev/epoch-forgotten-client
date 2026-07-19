import { AssetsService } from '../common/services/AssetsService';
import type { PreviewAssetCategory, PreviewAssetReference } from './types';

export type AssetCategory = PreviewAssetCategory | 'dialogue' | 'unknown';

export type AssetReferenceStatus = Readonly<{
    reference: string;
    category: AssetCategory;
    url: string;
}>;

export type AssetAvailability = AssetReferenceStatus &
    Readonly<{
        available: boolean;
        statusCode?: number;
    }>;

const SCENE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];
const AUDIO_EXTENSIONS = ['.ogg', '.mp3', '.wav'];

const hasExtension = (reference: string, extensions: readonly string[]): boolean =>
    extensions.some((extension) => reference.endsWith(extension));

export const classifyAssetReference = (reference: string): AssetCategory => {
    if (reference.startsWith('story/')) {
        return 'character';
    }
    if (reference.startsWith('group1/') || reference.startsWith('enemies/')) {
        return 'enemy';
    }
    if (reference.startsWith('items/') || reference.startsWith('equipment/')) {
        return 'item';
    }
    if (reference.startsWith('skills/')) {
        return 'skill';
    }
    if (hasExtension(reference, AUDIO_EXTENSIONS)) {
        return reference.includes('music') || reference.includes('battle') ? 'music' : 'sound';
    }
    if (hasExtension(reference, SCENE_EXTENSIONS)) {
        return 'scene';
    }
    if (reference.includes('/')) {
        return 'unknown';
    }
    if (hasExtension(reference, AUDIO_EXTENSIONS)) {
        return 'sound';
    }
    if (hasExtension(reference, SCENE_EXTENSIONS)) {
        return 'scene';
    }
    return 'unknown';
};

export const resolveAssetUrl = (reference: string, category: AssetCategory): string => {
    switch (category) {
        case 'character':
        case 'dialogue':
            return AssetsService.getCharacterUri(reference);
        case 'enemy':
            return AssetsService.getEnemyUri(reference);
        case 'item':
            return AssetsService.getItemUri(reference);
        case 'skill':
            return AssetsService.getSkillUri(reference);
        case 'scene':
            return AssetsService.getSceneUri(reference);
        case 'music':
            return AssetsService.getMusicUri(reference);
        case 'sound':
            return AssetsService.getSoundUri(reference);
        case 'unknown':
            return `${reference}`;
        default: {
            const unhandled: never = category;
            return unhandled;
        }
    }
};

export const projectAssetReference = (
    reference: string,
    category: AssetCategory = classifyAssetReference(reference),
): AssetReferenceStatus => {
    return {
        reference,
        category,
        url: resolveAssetUrl(reference, category),
    };
};

export const checkAssetAvailability = async (
    status: AssetReferenceStatus,
    fetchImpl: typeof fetch = fetch,
): Promise<AssetAvailability> => {
    try {
        const response = await fetchImpl(status.url, { method: 'HEAD' });
        return {
            ...status,
            available: response.ok,
            statusCode: response.status,
        };
    } catch {
        return {
            ...status,
            available: false,
        };
    }
};

export const checkAssetInventory = async (
    references: readonly PreviewAssetReference[],
    fetchImpl: typeof fetch = fetch,
): Promise<readonly AssetAvailability[]> =>
    Promise.all(
        references.map(({ reference, category }) =>
            checkAssetAvailability(projectAssetReference(reference, category), fetchImpl),
        ),
    );
