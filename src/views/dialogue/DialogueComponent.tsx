import { KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { getNpc } from '../../common/api/.generated';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import { runExclusive } from '../../common/runExclusive';
import { AssetsService } from '../../common/services/AssetsService';
import { applyGameOutcome } from '../../common/services/gameOutcome';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import {
    completeDialogueRun,
    createDialogueRun,
    type ActiveDialogueRun,
} from './dialogueCompletion';
import style from './DialogueComponent.module.scss';
import type { DialogueGraphNode, DialogueGraphWalker } from './dialogueGraph';
import { getLineImageUrl, getSpeakerImageUri, getSpeakerLabel, toDialogueGraph } from './dialoguePresentation';

const DialogueComponent = () => {
    const { npcName, setView } = useGameStore();
    const [dialogueRun, setDialogueRun] = useState<ActiveDialogueRun>();
    const [currentNode, setCurrentNode] = useState<DialogueGraphNode>();
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [npcTitle, setNpcTitle] = useState<string>();
    const [displayShop, setDisplayShop] = useState(false);
    const [loadError, setLoadError] = useState<string>();
    const [completionError, setCompletionError] = useState<string>();
    const [loadAttempt, setLoadAttempt] = useState(0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const retryButtonRef = useRef<HTMLButtonElement>(null);
    const interactionInFlightRef = useRef(false);
    const statusId = useId();

    useEffect(() => {
        wrapperRef.current?.focus();
    }, [isLoading]);

    useEffect(() => {
        if (loadError || completionError) {
            retryButtonRef.current?.focus();
        }
    }, [completionError, loadError]);

    useEffect(() => {
        let cancelled = false;
        interactionInFlightRef.current = false;
        setIsLoading(true);
        setLoadError(undefined);
        setCompletionError(undefined);

        const fetchAndStartDialogue = async () => {
            try {
                if (!npcName) {
                    throw new Error('No NPC selected');
                }
                const npcData = await getNpc(npcName);
                if (cancelled) {
                    return;
                }
                const run = createDialogueRun(toDialogueGraph(npcData.dialogue));

                setNpcTitle(npcData.title);
                setDisplayShop(npcData.shop !== undefined);
                setDialogueRun(run);
                setCurrentNode(run.walker.getCurrentNode());
            } catch {
                if (!cancelled) {
                    setLoadError('Unable to load dialogue.');
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void fetchAndStartDialogue();
        return () => {
            cancelled = true;
        };
    }, [npcName, loadAttempt]);

    const finishDialogue = async (activeRun: ActiveDialogueRun) => {
        if (!npcName) {
            return;
        }
        setIsSubmitting(true);
        const result = await completeDialogueRun(npcName, activeRun).catch((error: unknown) => {
            console.error('Unable to complete dialogue', error);
            setCompletionError('Unable to complete dialogue. Try again.');
        });
        setIsSubmitting(false);
        if (!result) {
            return;
        }
        if (result.status === 'completed') {
            await applyGameOutcome(result.events);
        }
        setDialogueRun(undefined);
        setCurrentNode(undefined);
        setLoadAttempt((attempt) => attempt + 1);
    };

    const step = (move: (walker: DialogueGraphWalker) => DialogueGraphNode | undefined) =>
        runExclusive(interactionInFlightRef, async () => {
            if (!dialogueRun) {
                return;
            }
            const nextNode = dialogueRun.walker.getCurrentNode() && move(dialogueRun.walker);
            if (nextNode) {
                setCurrentNode(nextNode);
                return;
            }
            await finishDialogue(dialogueRun);
        });

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (completionError || event.repeat) {
            return;
        }
        const option =
            currentNode?.kind === 'choice' && /^[1-9]$/.test(event.key)
                ? currentNode.choices[Number(event.key) - 1]
                : undefined;
        if (option) {
            event.preventDefault();
            void step((walker) => walker.choose(option.id));
            return;
        }
        // A focused button already activates itself on Space and Enter.
        if (
            currentNode?.kind !== 'line' ||
            event.target instanceof HTMLButtonElement ||
            (event.key !== ' ' && event.key !== 'Enter')
        ) {
            return;
        }
        event.preventDefault();
        void step((walker) => walker.advance());
    };

    const speakerLabel = currentNode ? getSpeakerLabel(currentNode.speaker) : '';
    const speakerImageUri = currentNode ? getSpeakerImageUri(currentNode.speaker) : undefined;
    const lineImageUri =
        currentNode?.kind === 'line' && currentNode.imageUri
            ? getLineImageUrl(currentNode.imageUri)
            : undefined;

    return (
        <div
            className={style.dialogueWrapper}
            onKeyDown={handleKeyDown}
            tabIndex={-1}
            ref={wrapperRef}>
            {isLoading ? (
                <LoadingOverlay />
            ) : loadError ? (
                <div className={`${style.dialogueItem} ${style.errorState}`}>
                    <p id={statusId} role="status">
                        {loadError}
                    </p>
                    <button
                        ref={retryButtonRef}
                        type="button"
                        aria-describedby={statusId}
                        className={style.dialogueBtn}
                        onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
                        Try again
                    </button>
                </div>
            ) : (
                currentNode && (
                    <div className={style.dialogueItem}>
                        {npcTitle && <div className={style.dialogueLabel}>{npcTitle}</div>}
                        <div className={style.dialogueContent}>
                            {speakerImageUri ? (
                                <img
                                    src={AssetsService.getCharacterUri(speakerImageUri)}
                                    alt={speakerLabel}
                                    className={style.dialogueImage}
                                />
                            ) : (
                                <div className={style.dialogueImage} />
                            )}
                            <p>
                                {speakerLabel ? (
                                    <span>
                                        <b>{speakerLabel}</b>: {currentNode.text}
                                    </span>
                                ) : (
                                    <i>{currentNode.text}</i>
                                )}
                            </p>
                            {lineImageUri ? (
                                <img
                                    src={lineImageUri}
                                    alt={
                                        currentNode.kind === 'line'
                                            ? currentNode.imageAlt ?? ''
                                            : ''
                                    }
                                    className={style.dialogueImage}
                                />
                            ) : (
                                <div className={style.dialogueImage} />
                            )}
                        </div>
                        {currentNode.kind === 'choice' && !completionError && (
                            <>
                                {currentNode.choices.map((option, index) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => void step((walker) => walker.choose(option.id))}
                                        className={style.dialogueBtn}
                                        disabled={isSubmitting}>
                                        {index + 1}: {option.text}
                                    </button>
                                ))}
                            </>
                        )}
                        {currentNode.kind === 'line' && !completionError && (
                            <button
                                type="button"
                                onClick={() => void step((walker) => walker.advance())}
                                className={style.dialogueBtn}
                                disabled={isSubmitting}>
                                OK
                            </button>
                        )}
                        {completionError && dialogueRun && (
                            <>
                                <p id={statusId} role="status">
                                    {completionError}
                                </p>
                                <button
                                    ref={retryButtonRef}
                                    type="button"
                                    aria-describedby={statusId}
                                    onClick={() =>
                                        void runExclusive(interactionInFlightRef, () =>
                                            finishDialogue(dialogueRun),
                                        )
                                    }
                                    className={style.dialogueBtn}>
                                    Retry
                                </button>
                            </>
                        )}
                        {displayShop && (
                            <button
                                type="button"
                                className={style.shopButton}
                                aria-label="Open shop"
                                onClick={() => setView(GameView.ShopBuy)}>
                                <img src={AssetsService.getIcon('SHOP')} alt="" />
                            </button>
                        )}
                    </div>
                )
            )}
        </div>
    );
};

export default DialogueComponent;
