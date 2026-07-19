import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { checkAssetInventory, type AssetAvailability } from '../../content/assets';
import { loadPreviewBundle, type PreviewBundleLoadResult } from '../../content/loader';
import {
    listCatalogIds,
    projectBundleSummary,
    projectDialogueGraph,
    projectNpcDialogues,
    projectQuest,
    projectScene,
} from '../../content/projections';
import type { JsonObject, PreviewBundle } from '../../content/types';
import style from './ContentLabComponent.module.scss';
import {
    PreviewCharacterCard,
    PreviewClassCard,
    PreviewEnemyCard,
    PreviewItemCard,
    PreviewSkillCard,
} from './PreviewCards';
import { SceneMapPreview } from './SceneMapPreview';

type ContentLabSection =
    | 'overview'
    | 'scenes'
    | 'dialogues'
    | 'quests'
    | 'npc-dialogues'
    | 'characters'
    | 'enemies'
    | 'items'
    | 'skills'
    | 'classes'
    | 'assets';

const SECTIONS: readonly ContentLabSection[] = [
    'overview',
    'scenes',
    'dialogues',
    'quests',
    'npc-dialogues',
    'characters',
    'enemies',
    'items',
    'skills',
    'classes',
    'assets',
];

const sectionLabel = (section: ContentLabSection): string => {
    switch (section) {
        case 'overview':
            return 'Overview';
        case 'scenes':
            return 'Scenes';
        case 'dialogues':
            return 'Dialogues';
        case 'quests':
            return 'Quests';
        case 'npc-dialogues':
            return 'NPC selection';
        case 'characters':
            return 'Characters';
        case 'enemies':
            return 'Enemies';
        case 'items':
            return 'Items';
        case 'skills':
            return 'Skills';
        case 'classes':
            return 'Classes';
        case 'assets':
            return 'Assets';
        default: {
            const unhandled: never = section;
            return unhandled;
        }
    }
};

export const ContentLabComponent = () => {
    const [loadResult, setLoadResult] = useState<PreviewBundleLoadResult | null>(null);
    const [section, setSection] = useState<ContentLabSection>('overview');
    const [selectedSceneId, setSelectedSceneId] = useState('');
    const [selectedDialogueId, setSelectedDialogueId] = useState('');
    const [selectedQuestId, setSelectedQuestId] = useState('');
    const [assetStatuses, setAssetStatuses] = useState<readonly AssetAvailability[]>([]);
    const [assetsLoading, setAssetsLoading] = useState(false);

    useEffect(() => {
        void loadPreviewBundle().then(setLoadResult);
    }, []);

    const bundle = loadResult?.kind === 'loaded' ? loadResult.bundle : null;

    useEffect(() => {
        if (!bundle) {
            return;
        }
        const sceneIds = listCatalogIds(bundle.catalog, 'scene');
        const dialogueIds = listCatalogIds(bundle.catalog, 'dialogue');
        const questIds = listCatalogIds(bundle.catalog, 'quest');
        if (!selectedSceneId && sceneIds[0]) {
            setSelectedSceneId(sceneIds[0]);
        }
        if (!selectedDialogueId && dialogueIds[0]) {
            setSelectedDialogueId(dialogueIds[0]);
        }
        if (!selectedQuestId && questIds[0]) {
            setSelectedQuestId(questIds[0]);
        }
    }, [bundle, selectedDialogueId, selectedQuestId, selectedSceneId]);

    useEffect(() => {
        if (!bundle || section !== 'assets') {
            return;
        }
        setAssetsLoading(true);
        void checkAssetInventory(bundle.report.assets.references)
            .then(setAssetStatuses)
            .finally(() => setAssetsLoading(false));
    }, [bundle, section]);

    const summary = useMemo(() => (bundle ? projectBundleSummary(bundle) : null), [bundle]);
    const npcDialogues = useMemo(() => (bundle ? projectNpcDialogues(bundle.catalog) : []), [bundle]);

    if (!loadResult) {
        return <p className={style.status}>Loading preview bundle...</p>;
    }

    if (loadResult.kind !== 'loaded') {
        return (
            <section className={style.recovery}>
                <h1>Content Lab</h1>
                <p>{loadResult.message}</p>
                <code>{loadResult.syncCommand}</code>
            </section>
        );
    }

    const loadedBundle = loadResult.bundle;

    return (
        <div className={style.wrapper}>
            <header className={style.header}>
                <h1>Content Lab</h1>
                <p>Local preview only. No saves, no uploads.</p>
            </header>
            <div className={style.layout}>
                <nav className={style.nav}>
                    {SECTIONS.map((entry) => (
                        <button
                            key={entry}
                            type="button"
                            className={entry === section ? style.navActive : ''}
                            onClick={() => setSection(entry)}>
                            {sectionLabel(entry)}
                        </button>
                    ))}
                </nav>
                <main className={style.panel}>
                    {section === 'overview' && summary && (
                        <OverviewPanel bundle={loadedBundle} summary={summary} />
                    )}
                    {section === 'scenes' && (
                        <ScenePanel bundle={loadedBundle} selectedSceneId={selectedSceneId} onSelectScene={setSelectedSceneId} />
                    )}
                    {section === 'dialogues' && (
                        <DialoguePanel
                            bundle={loadedBundle}
                            selectedDialogueId={selectedDialogueId}
                            onSelectDialogue={setSelectedDialogueId}
                        />
                    )}
                    {section === 'quests' && (
                        <QuestPanel bundle={loadedBundle} selectedQuestId={selectedQuestId} onSelectQuest={setSelectedQuestId} />
                    )}
                    {section === 'npc-dialogues' && <NpcDialoguePanel projections={npcDialogues} />}
                    {section === 'characters' && <CardGridPanel bundle={loadedBundle} kind="character" Card={PreviewCharacterCard} />}
                    {section === 'enemies' && <CardGridPanel bundle={loadedBundle} kind="enemy" Card={PreviewEnemyCard} />}
                    {section === 'items' && <CardGridPanel bundle={loadedBundle} kind="item" Card={PreviewItemCard} />}
                    {section === 'skills' && <CardGridPanel bundle={loadedBundle} kind="skill" Card={PreviewSkillCard} />}
                    {section === 'classes' && <CardGridPanel bundle={loadedBundle} kind="class" Card={PreviewClassCard} />}
                    {section === 'assets' && (
                        <AssetsPanel
                            references={loadedBundle.report.assets.references}
                            statuses={assetStatuses}
                            loading={assetsLoading}
                        />
                    )}
                </main>
            </div>
        </div>
    );
};

const OverviewPanel = ({
    bundle,
    summary,
}: {
    bundle: PreviewBundle;
    summary: ReturnType<typeof projectBundleSummary>;
}) => (
    <section>
        <h2>Bundle</h2>
        <p>
            Source hash: <code>{summary.sourceHash}</code>
        </p>
        <p>Packs: {summary.packNames.join(', ')}</p>
        <h3>Counts</h3>
        <ul>
            {Object.entries(summary.counts).map(([kind, count]) => (
                <li key={kind}>
                    {kind}: {count}
                </li>
            ))}
        </ul>
        <h3>Balance issues</h3>
        {bundle.report.issues.length === 0 ? (
            <p>No balance warnings.</p>
        ) : (
            <ul>
                {bundle.report.issues.map((issue) => (
                    <li key={`${issue.path}-${issue.code}`}>
                        [{issue.severity}] {issue.code} — {issue.message} ({issue.path})
                    </li>
                ))}
            </ul>
        )}
    </section>
);

const ScenePanel = ({
    bundle,
    selectedSceneId,
    onSelectScene,
}: {
    bundle: PreviewBundle;
    selectedSceneId: string;
    onSelectScene: (sceneId: string) => void;
}) => {
    const sceneIds = listCatalogIds(bundle.catalog, 'scene');
    const scene = selectedSceneId ? bundle.catalog.scene[selectedSceneId] : undefined;
    const projection = scene ? projectScene(selectedSceneId, scene, bundle.catalog) : null;
    return (
        <section>
            <h2>Scenes</h2>
            <select value={selectedSceneId} onChange={(event) => onSelectScene(event.target.value)}>
                {sceneIds.map((sceneId) => (
                    <option key={sceneId} value={sceneId}>
                        {sceneId}
                    </option>
                ))}
            </select>
            {projection ? <SceneMapPreview scene={projection} /> : null}
        </section>
    );
};

const DialoguePanel = ({
    bundle,
    selectedDialogueId,
    onSelectDialogue,
}: {
    bundle: PreviewBundle;
    selectedDialogueId: string;
    onSelectDialogue: (dialogueId: string) => void;
}) => {
    const dialogueIds = listCatalogIds(bundle.catalog, 'dialogue');
    const dialogue = selectedDialogueId ? bundle.catalog.dialogue[selectedDialogueId] : undefined;
    const graph = dialogue ? projectDialogueGraph(dialogue, bundle.catalog) : null;
    return (
        <section>
            <h2>Dialogues</h2>
            <select value={selectedDialogueId} onChange={(event) => onSelectDialogue(event.target.value)}>
                {dialogueIds.map((dialogueId) => (
                    <option key={dialogueId} value={dialogueId}>
                        {dialogueId}
                    </option>
                ))}
            </select>
            {graph ? (
                <>
                    <p>
                        Entry: <code>{graph.startNodeId}</code>
                    </p>
                    {graph.diagnostics.length > 0 ? (
                        <ul>
                            {graph.diagnostics.map((diagnostic) => (
                                <li key={`${diagnostic.code}-${diagnostic.nodeId}`}>
                                    [{diagnostic.code}] {diagnostic.message}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>Graph reaches explicit end from every reachable node.</p>
                    )}
                    {graph.completionCommandTraces.length > 0 ? (
                        <>
                            <h4>Completion commands</h4>
                            <CommandTraceList traces={graph.completionCommandTraces} />
                        </>
                    ) : null}
                    <ol>
                        {graph.nodes.map((node) => (
                            <li key={node.id}>
                                <p>
                                    <code>{node.id}</code> ({node.kind}) —{' '}
                                    <strong>{node.speaker.label}</strong>: {node.text}
                                </p>
                                {node.next ? (
                                    <p>
                                        Edge: <code>{node.next.target}</code>
                                    </p>
                                ) : null}
                                {node.choices && node.choices.length > 0 ? (
                                    <ul>
                                        {node.choices.map((choice) => (
                                            <li key={choice.id}>
                                                <code>{choice.id}</code>: {choice.text} {'->'}{' '}
                                                <code>{choice.next.target}</code>
                                                {choice.conditionSummary ? (
                                                    <span> if {choice.conditionSummary}</span>
                                                ) : null}
                                                {choice.commandTraces.length > 0 ? (
                                                    <CommandTraceList traces={choice.commandTraces} />
                                                ) : null}
                                            </li>
                                        ))}
                                    </ul>
                                ) : null}
                            </li>
                        ))}
                    </ol>
                </>
            ) : null}
        </section>
    );
};

const QuestPanel = ({
    bundle,
    selectedQuestId,
    onSelectQuest,
}: {
    bundle: PreviewBundle;
    selectedQuestId: string;
    onSelectQuest: (questId: string) => void;
}) => {
    const questIds = listCatalogIds(bundle.catalog, 'quest');
    const quest = selectedQuestId ? bundle.catalog.quest[selectedQuestId] : undefined;
    const projection = quest ? projectQuest(quest) : null;
    return (
        <section>
            <h2>Quests</h2>
            <select value={selectedQuestId} onChange={(event) => onSelectQuest(event.target.value)}>
                {questIds.map((questId) => (
                    <option key={questId} value={questId}>
                        {questId}
                    </option>
                ))}
            </select>
            {projection ? (
                <>
                    <h3>{projection.label}</h3>
                    <p>
                        Journal hint: {projection.journalHint}
                    </p>
                    <p>
                        Initial stage: <code>{projection.initialStageId}</code>
                        {projection.main ? ' (main quest)' : ''}
                    </p>
                    <p>Lifecycle: {projection.lifecycleStates.join(' -> ')}</p>
                    <h4>Stages</h4>
                    <ul>
                        {projection.stages.map((stage) => (
                            <li key={stage.stageId}>
                                <strong>
                                    <code>{stage.stageId}</code>
                                </strong>
                                : {stage.objective}
                                <p>{stage.description}</p>
                                {stage.goals.length > 0 ? (
                                    <ul>
                                        {stage.goals.map((goal) => (
                                            <li key={goal.id}>
                                                <code>{goal.id}</code> ({goal.kind}) {goal.label} x
                                                {goal.target} — <code>{goal.reference}</code>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p>No named goals.</p>
                                )}
                            </li>
                        ))}
                    </ul>
                    <h4>Transitions</h4>
                    <ul>
                        {projection.transitions.map((transition) => (
                            <li key={transition.transitionId}>
                                <code>{transition.transitionId}</code> ({transition.kind}):{' '}
                                {transition.summary}
                                <p>{transition.lifecycleEffect}</p>
                                {transition.conditionSummary ? (
                                    <p>Condition: {transition.conditionSummary}</p>
                                ) : null}
                                {transition.commandTraces.length > 0 ? (
                                    <CommandTraceList traces={transition.commandTraces} />
                                ) : null}
                            </li>
                        ))}
                    </ul>
                </>
            ) : null}
        </section>
    );
};

const NpcDialoguePanel = ({
    projections,
}: {
    projections: ReturnType<typeof projectNpcDialogues>;
}) => (
    <section>
        <h2>NPC dialogue selection</h2>
        {projections.map((npc) => (
            <details key={npc.npcId} open>
                <summary>
                    {npc.label}
                    {npc.title ? ` — ${npc.title}` : ''} (<code>{npc.npcId}</code>)
                </summary>
                {npc.priority.length > 0 ? (
                    <>
                        <h3>Priority</h3>
                        <ol>
                            {npc.priority.map((entry) => (
                                <li key={`${npc.npcId}-${entry.order}-${entry.dialogueId}`}>
                                    <code>{entry.dialogueId}</code> — {entry.conditionSummary}
                                </li>
                            ))}
                        </ol>
                    </>
                ) : (
                    <p>No conditioned priority entries.</p>
                )}
                <h3>Fallback</h3>
                {npc.fallback.kind === 'fixed' ? (
                    <p>
                        Fixed: <code>{npc.fallback.dialogueId}</code>
                    </p>
                ) : (
                    <ul>
                        {npc.fallback.dialogueIds.map((dialogueId) => (
                            <li key={`${npc.npcId}-fallback-${dialogueId}`}>
                                <code>{dialogueId}</code> (random pool)
                            </li>
                        ))}
                    </ul>
                )}
            </details>
        ))}
    </section>
);

const CardGridPanel = ({
    bundle,
    kind,
    Card,
}: {
    bundle: PreviewBundle;
    kind: 'character' | 'enemy' | 'item' | 'skill' | 'class';
    Card: ({ definition }: { definition: JsonObject }) => ReactElement;
}) => {
    const bucket = bundle.catalog[kind];
    return (
        <section className={style.cardGrid}>
            {Object.values(bucket).map((definition) => (
                <Card key={String(definition.id)} definition={definition} />
            ))}
        </section>
    );
};

const CommandTraceList = ({
    traces,
}: {
    traces: ReadonlyArray<{
        commandSummary: string;
        expectedEvents: readonly string[];
        note: string;
    }>;
}) => (
    <ul className={style.traceList}>
        {traces.map((trace) => (
            <li key={trace.commandSummary}>
                <code>{trace.commandSummary}</code> {'->'} {trace.expectedEvents.join(', ')}
                <span className={style.traceNote}> ({trace.note})</span>
            </li>
        ))}
    </ul>
);

const AssetsPanel = ({
    references,
    statuses,
    loading,
}: {
    references: PreviewBundle['report']['assets']['references'];
    statuses: readonly AssetAvailability[];
    loading: boolean;
}) => (
    <section>
        <h2>Asset inventory</h2>
        <p>{references.length} references from compiler report.</p>
        {loading ? <p>Checking asset URLs...</p> : null}
        <ul className={style.assetList}>
            {(statuses.length > 0
                ? statuses
                : references.map(({ category, reference }) => ({
                    reference,
                    url: reference,
                    available: false,
                    category,
                }))
            ).map((entry) => (
                <li key={entry.reference}>
                    <span>{entry.available ? 'ok' : 'missing'}</span> {entry.reference}
                    {'url' in entry ? <code>{entry.url}</code> : null}
                </li>
            ))}
        </ul>
    </section>
);
