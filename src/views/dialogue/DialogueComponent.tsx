import style from './DialogueComponent.module.scss';
import { useEffect, useState, KeyboardEvent, useRef } from 'react';
import { DialogueService } from './DialogueService';
import { npcsClient } from '../../common/api/client';
import type { DialogueNode } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import { AssetsService } from '../../common/services/AssetsService';

const DialogueComponent = () => {
    const { npcName, dialogue, setView, setDialogue } = useGameStore();
    const [service, setService] = useState<DialogueService>();
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
        newService.start();

        setService(newService);
        setIsLoading(false);
    };

    const handleOptionClick = async (optionIndex: number) => {
        await service?.handleUserInput(optionIndex);
    };

    const handleOkClick = async () => {
        if (!currentNode?.options) {
            service?.proceedToNextNode();
        }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
        event.preventDefault();
        const pressedKey = event.key;
        if (pressedKey === ' ' || pressedKey === 'Spacebar') {
            handleOkClick();
        } else if (currentNode?.options && /^[1-9]$/.test(pressedKey)) {
            const keyIndex = parseInt(pressedKey, 10) - 1;
            handleOptionClick(keyIndex);
        }
    };

    return (
        <div className={style.dialogueWrapper} onKeyDown={handleKeyPress} tabIndex={-1} ref={ref}>
            {isLoading ? (
                <LoadingOverlay />
            ) : (
                currentNode && (
                    <div className={style.dialogueItem}>
                        {npcTitle && <div className={style.dialogueLabel}>{npcTitle}</div>}
                        <p>
                            {currentNode.author ? (
                                <span>
                                    <b>{currentNode.author}</b>: {currentNode.text}
                                </span>
                            ) : (
                                <i>{currentNode.text}</i>
                            )}
                        </p>
                        {currentNode.options && (
                            <>
                                {currentNode.options.map((option, index) => (
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionClick(index)}
                                        className={style.dialogueBtn}>
                                        {index + 1}: {option.text}
                                    </button>
                                ))}
                            </>
                        )}
                        {showOkButton && (
                            <button onClick={handleOkClick} className={style.dialogueBtn}>
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
