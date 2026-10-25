import { KeyboardEvent, useEffect, useRef, useState } from 'react';
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
import type { DialogueGraphNode } from './dialogueGraph';
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
        try {
            const result = await completeDialogueRun(npcName, activeRun);
            if (result.status === 'stale') {
                setDialogueRun(undefined);
                setCurrentNode(undefined);
                setLoadAttempt((attempt) => attempt + 1);
                return;
            }
            await applyGameOutcome(result.events);
            setDialogueRun(undefined);
            setCurrentNode(undefined);
            setLoadAttempt((attempt) => attempt + 1);
        } catch {
            setCompletionError('Unable to complete dialogue. Try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptionClick = async (optionId: string) => {
        await runExclusive(interactionInFlightRef, async () => {
            if (!dialogueRun) {
                return;
            }
            if (!dialogueRun.walker.getCurrentNode()) {
                await finishDialogue(dialogueRun);
                return;
            }
            const nextNode = dialogueRun.walker.choose(optionId);
            if (nextNode) {
                setCurrentNode(nextNode);
                return;
            }
            await finishDialogue(dialogueRun);
        });
    };

    const handleOkClick = async () => {
        await runExclusive(interactionInFlightRef, async () => {
            if (!dialogueRun || currentNode?.kind !== 'line') {
                return;
            }
            if (!dialogueRun.walker.getCurrentNode()) {
                await finishDialogue(dialogueRun);
                return;
            }
            const nextNode = dialogueRun.walker.advance();
            if (nextNode) {
                setCurrentNode(nextNode);
                return;
            }
            await finishDialogue(dialogueRun);
        });
    };

    const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
        if (
            completionError ||
            event.repeat ||
            event.target instanceof HTMLButtonElement
        ) {
            return;
        }
        const pressedKey = event.key;
        if (pressedKey === ' ' || pressedKey === 'Spacebar' || pressedKey === 'Enter') {
            event.preventDefault();
            void handleOkClick();
        } else if (currentNode?.kind === 'choice' && /^[1-9]$/.test(pressedKey)) {
            const keyIndex = parseInt(pressedKey, 10) - 1;
            const option = currentNode.choices[keyIndex];
            if (option) {
                event.preventDefault();
                void handleOptionClick(option.id);
            }
        }
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
            onKeyDown={handleKeyPress}
            tabIndex={-1}
            ref={wrapperRef}>
            {isLoading ? (
                <LoadingOverlay />
            ) : loadError ? (
                <div className={`${style.dialogueItem} ${style.errorState}`}>
                    <p role="status">{loadError}</p>
                    <button
                        ref={retryButtonRef}
                        type="button"
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
                                        onClick={() => void handleOptionClick(option.id)}
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
                                onClick={() => void handleOkClick()}
                                className={style.dialogueBtn}
                                disabled={isSubmitting}>
                                OK
                            </button>
                        )}
                        {completionError && dialogueRun && (
                            <>
                                <p role="status">{completionError}</p>
                                <button
                                    ref={retryButtonRef}
                                    type="button"
                                    onClick={() =>
                                        void runExclusive(interactionInFlightRef, () =>
                                            finishDialogue(dialogueRun),
                                        )
                                    }
                                    className={style.dialogueBtn}
                                    disabled={isSubmitting}>
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
