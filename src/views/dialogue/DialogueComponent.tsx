import style from './DialogueComponent.module.scss';
import { useEffect, useState, KeyboardEvent, useRef } from 'react';
import { DialogueService } from './DialogueService';
import { npcsClient } from '../../common/api/client';
import type { DialogueNode, Item } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import ShopComponent from '../shop/ShopComponent';
import { AssetsService } from '../../common/services/AssetsService';

const DialogueComponent = () => {
    const { npc, setView } = useGameStore();
    const [service, setService] = useState<DialogueService>();
    const [currentNode, setCurrentNode] = useState<DialogueNode>();
    const [isLoading, setIsLoading] = useState(true);
    const [showOkButton, setShowOkButton] = useState(false);
    const [npcTitle, setNpcTitle] = useState<string>();
    const [npcShop, setNpcShop] = useState<Item[]>();
    const [displayShop, setDisplayShop] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, [isLoading]);

    useEffect(() => {
        const fetchAndStartDialogue = async () => {
            setIsLoading(true);
            if (!npc) {
                return;
            }
            const npcData = (await npcsClient.getNpc(npc.npcName)).data;

            setNpcTitle(npcData.title);
            setNpcShop(npcData.shop);

            const newService = new DialogueService(npc.npcName, npcData.dialogue, {
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

        fetchAndStartDialogue();
    }, []);

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

    if (displayShop && npcShop) {
        return <ShopComponent npcShop={npcShop} onClose={() => setDisplayShop(false)} />;
    }

    return (
        <div className={style.dialogueWrapper} onKeyDown={handleKeyPress} tabIndex={-1} ref={ref}>
            {isLoading ? (
                <LoadingOverlay />
            ) : (
                currentNode && (
                    <div className={style.dialogueItem}>
                        {npcTitle && <div className={style.dialogueLabel}>{npcTitle}</div>}
                        <p>
                            {currentNode.author}: {currentNode.text}
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
                        {npcShop && (
                            <button className={style.shopButton} onClick={() => setDisplayShop(true)}>
                                <img src={AssetsService.getIcon('SHOP')} alt='shop' />
                            </button>
                        )}
                    </div>
                )
            )}
        </div>
    );
};

export default DialogueComponent;
