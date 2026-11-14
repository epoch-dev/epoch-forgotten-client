export const PREVIEW_BUNDLE_VERSION = 3 as const;
export const CONTENT_KINDS = [
    'character',
    'class',
    'dialogue',
    'encounter',
    'enemy',
    'flag',
    'item',
    'npc',
    'quest',
    'scene',
    'skill',
] as const;

export type ContentKind = (typeof CONTENT_KINDS)[number];
export type ContentId<TKind extends ContentKind = ContentKind> = `${string}:${TKind}/${string}`;
export type SourceHash = string;
export type PreviewAssetCategory = 'character' | 'enemy' | 'item' | 'skill' | 'scene' | 'music' | 'sound';

export type JsonPrimitive = boolean | number | string | null;
export type JsonObject = { readonly [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonObject | readonly JsonValue[];

export type ContentCondition = JsonObject;

export type PreviewIssue = Readonly<{
    code: string;
    message: string;
    path: string;
    severity: 'error' | 'warning';
}>;

export type PreviewAssetReference = Readonly<{
    category: PreviewAssetCategory;
    reference: string;
}>;

export type PreviewReport = Readonly<{
    version: 1;
    sourceHash: SourceHash;
    counts: Readonly<Record<ContentKind, number>>;
    issues: readonly PreviewIssue[];
    assets: Readonly<{
        references: readonly PreviewAssetReference[];
    }>;
}>;

export type PreviewPack = Readonly<{
    name: string;
    version: 1;
    dependencies: readonly string[];
}>;

export type PreviewCatalog = Readonly<{
    version: 1;
    character: Readonly<Record<string, JsonObject>>;
    class: Readonly<Record<string, JsonObject>>;
    dialogue: Readonly<Record<string, JsonObject>>;
    encounter: Readonly<Record<string, JsonObject>>;
    encounterOverlay: readonly JsonObject[];
    enemy: Readonly<Record<string, JsonObject>>;
    flag: Readonly<Record<string, JsonObject>>;
    item: Readonly<Record<string, JsonObject>>;
    npc: Readonly<Record<string, JsonObject>>;
    quest: Readonly<Record<string, JsonObject>>;
    scene: Readonly<Record<string, JsonObject>>;
    skill: Readonly<Record<string, JsonObject>>;
}>;

export type PreviewBundle = Readonly<{
    version: typeof PREVIEW_BUNDLE_VERSION;
    sourceHash: SourceHash;
    packs: readonly PreviewPack[];
    catalog: PreviewCatalog;
    report: PreviewReport;
}>;

export const PREVIEW_SYNC_COMMAND = 'yarn content:sync-preview';
