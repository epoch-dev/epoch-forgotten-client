import style from './DialogueComponent.module.scss';
import { useEffect, useState, KeyboardEvent, useRef } from 'react';
import { DialogueService } from './DialogueService';
import { npcsClient } from '../../common/api/client';
import type { DialogueNode, NpcDialogue } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import { AssetsService } from '../../common/services/AssetsService';
import { throttle } from '../../common/utils';

const DialogueComponent = () => {
    const { npcName, setView } = useGameStore();
    const [service, setService] = useState<DialogueService>();
    const [dialogue, setDialogue] = useState<NpcDialogue>();
    const [currentNode, setCurrentNode] = useState<DialogueNode>();
    const [isLoading, setIsLoading] = useState(true);
    const [showOkButton, setShowOkButton] = useState(false);
    const [npcTitle, setNpcTitle] = useState<string>();
    const [displayShop, setDisplayShop] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, [isLoading]);

    useEffect(() => {
        void fetchAndStartDialogue();

        return () => setDialogue(undefined);
    }, []);

    const fetchAndStartDialogue = async () => {
        setIsLoading(true);
        if (!npcName) {
            return;
        }
        const npcData = (await npcsClient.getNpc(npcName)).data;

        setNpcTitle(npcData.title);
        setDisplayShop(npcData.shop !== undefined);

        const newService = new DialogueService(npcName, dialogue ?? npcData.dialogue, {
            onNodeChange: (node) => {
                setCurrentNode(node);
                setShowOkButton(!(node && node.options));
            },
            onComplete: () => setView(GameView.World),
        });
        void newService.start();

        setService(newService);
        setIsLoading(false);
    };

    const handleOptionClick = async (optionIndex: number) => {
        await service?.handleUserInput(optionIndex);
    };

    const handleOkClick = async () => {
        if (!currentNode?.options) {
            await service?.proceedToNextNode();
        }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
        event.preventDefault();
        const pressedKey = event.key;
        if (pressedKey === ' ' || pressedKey === 'Spacebar') {
            void handleOkClick();
        } else if (currentNode?.options && /^[1-9]$/.test(pressedKey)) {
            const keyIndex = parseInt(pressedKey, 10) - 1;
            void handleOptionClick(keyIndex);
        }
    };

    return (
        <div
            className={style.dialogueWrapper}
            onKeyDown={throttle(handleKeyPress, 100)}
            tabIndex={-1}
            ref={ref}>
            {isLoading ? (
                <LoadingOverlay />
            ) : (
                currentNode && (
                    <div className={style.dialogueItem}>
                        {npcTitle && <div className={style.dialogueLabel}>{npcTitle}</div>}
                        <div className={style.dialogueContent}>
                            {currentNode.imageUri ? (
                                <img
                                    src={AssetsService.getCharacterUri(currentNode.imageUri)}
                                    alt={currentNode.author}
                                    className={style.dialogueImage}
                                />
                            ) : (
                                <div className={style.dialogueImage} />
                            )}
                            <p>
                                {currentNode.author ? (
                                    <span>
                                        <b>{currentNode.author}</b>: {currentNode.text}
                                    </span>
                                ) : (
                                    <i>{currentNode.text}</i>
                                )}
                            </p>
                            <div className={style.dialogueImage} />
                        </div>
                        {currentNode.options && (
                            <>
                                {currentNode.options.map((option, index) => (
                                    <button
                                        key={option.id}
                                        onClick={throttle(() => handleOptionClick(index), 100)}
                                        className={style.dialogueBtn}>
                                        {index + 1}: {option.text}
                                    </button>
                                ))}
                            </>
                        )}
                        {showOkButton && (
                            <button onClick={throttle(handleOkClick, 100)} className={style.dialogueBtn}>
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
