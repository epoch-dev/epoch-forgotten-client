import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { npcsClient } from '../../common/api/client';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import { AssetsService } from '../../common/services/AssetsService';
import { ToastService } from '../../common/services/ToastService';
import { throttle } from '../../common/utils';
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
    const [showOkButton, setShowOkButton] = useState(false);
    const [npcTitle, setNpcTitle] = useState<string>();
    const [displayShop, setDisplayShop] = useState(false);
    const [loadError, setLoadError] = useState<string>();
    const [loadAttempt, setLoadAttempt] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const interactionInFlightRef = useRef(false);

    useEffect(() => {
        ref.current?.focus();
    }, [isLoading]);

    useEffect(() => {
        let cancelled = false;
        interactionInFlightRef.current = false;
        setIsLoading(true);
        setLoadError(undefined);

        const fetchAndStartDialogue = async () => {
            try {
                if (!npcName) {
                    throw new Error('No NPC selected');
                }
                const npcData = (await npcsClient.getNpc(npcName)).data;
                if (cancelled) {
                    return;
                }
                const run = createDialogueRun(toDialogueGraph(npcData.dialogue));

                setNpcTitle(npcData.title);
                setDisplayShop(npcData.shop !== undefined);
                setDialogueRun(run);
                setCurrentNode(run.walker.getCurrentNode());
                setShowOkButton(run.walker.getCurrentNode()?.kind === 'line');
            } catch {
                if (!cancelled) {
                    const message = 'Unable to load dialogue.';
                    setLoadError(message);
                    ToastService.error({ message });
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
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleOptionClick = async (optionId: string) => {
        if (!dialogueRun || interactionInFlightRef.current) {
            return;
        }
        interactionInFlightRef.current = true;
        try {
            if (!dialogueRun.walker.getCurrentNode()) {
                await finishDialogue(dialogueRun);
                return;
            }
            const nextNode = dialogueRun.walker.choose(optionId);
            if (nextNode) {
                setCurrentNode(nextNode);
                setShowOkButton(nextNode.kind === 'line');
                return;
            }
            await finishDialogue(dialogueRun);
        } finally {
            interactionInFlightRef.current = false;
        }
    };

    const handleOkClick = async () => {
        if (!dialogueRun || interactionInFlightRef.current || currentNode?.kind !== 'line') {
            return;
        }
        interactionInFlightRef.current = true;
        try {
            if (!dialogueRun.walker.getCurrentNode()) {
                await finishDialogue(dialogueRun);
                return;
            }
            const nextNode = dialogueRun.walker.advance();
            if (nextNode) {
                setCurrentNode(nextNode);
                setShowOkButton(nextNode.kind === 'line');
                return;
            }
            await finishDialogue(dialogueRun);
        } finally {
            interactionInFlightRef.current = false;
        }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
        event.preventDefault();
        const pressedKey = event.key;
        if (pressedKey === ' ' || pressedKey === 'Spacebar') {
            void handleOkClick();
        } else if (currentNode?.kind === 'choice' && /^[1-9]$/.test(pressedKey)) {
            const keyIndex = parseInt(pressedKey, 10) - 1;
            const option = currentNode.choices[keyIndex];
            if (option) {
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
            onKeyDown={throttle(handleKeyPress, 100)}
            tabIndex={-1}
            ref={ref}>
            {isLoading ? (
                <LoadingOverlay />
            ) : loadError ? (
                <div className={`${style.dialogueItem} ${style.errorState}`}>
                    <p>{loadError}</p>
                    <button
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
                                    alt=""
                                    className={style.dialogueImage}
                                />
                            ) : (
                                <div className={style.dialogueImage} />
                            )}
                        </div>
                        {currentNode.kind === 'choice' && (
                            <>
                                {currentNode.choices.map((option, index) => (
                                    <button
                                        key={option.id}
                                        onClick={throttle(() => handleOptionClick(option.id), 100)}
                                        className={style.dialogueBtn}
                                        disabled={isSubmitting}>
                                        {index + 1}: {option.text}
                                    </button>
                                ))}
                            </>
                        )}
                        {showOkButton && (
                            <button
                                onClick={throttle(handleOkClick, 100)}
                                className={style.dialogueBtn}
                                disabled={isSubmitting}>
                                OK
                            </button>
                        )}
                        {displayShop && (
                            <button className={style.shopButton} onClick={() => setView(GameView.ShopBuy)}>
                                <img src={AssetsService.getIcon('SHOP')} alt="shop" />
                            </button>
                        )}
                    </div>
                )
            )}
        </div>
    );
};

export default DialogueComponent;
