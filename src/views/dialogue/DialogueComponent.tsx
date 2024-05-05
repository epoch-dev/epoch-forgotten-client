import style from './DialogueComponent.module.scss';
import { useEffect, useState, KeyboardEvent, useRef } from 'react';
import { DialogueService } from './DialogueService';
import { NpcsClient } from '../../common/api/client';
import { DialogueNode } from '../../common/api/.generated';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';

const DialogueComponent = () => {
    const { npc, setView } = useGameStore();
    const [service, setService] = useState<DialogueService>();
    const [currentNode, setCurrentNode] = useState<DialogueNode>();
    const [isLoading, setIsLoading] = useState(true);
    const [showOkButton, setShowOkButton] = useState(false);
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
            const npcDialogues = (await NpcsClient.getNpcDialogue(npc.npcName)).data;
            const newService = new DialogueService(npc.npcName, npcDialogues, {
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
            event.preventDefault();
            handleOkClick();
        } else if (currentNode?.options && /^[1-9]$/.test(pressedKey)) {
            const keyIndex = parseInt(pressedKey, 10) - 1;
            handleOptionClick(keyIndex);
        }
    };

    const LoadingDiv = () => <div className={style.dialogueItem}>Loading dialogue...</div>;

    return (
        <div className={style.dialogueWrapper} onKeyDown={handleKeyPress} ref={ref}>
            {isLoading ? (
                <LoadingDiv />
            ) : (
                currentNode && (
                    <div className={style.dialogueItem}>
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
                                Ok
                            </button>
                        )}
                    </div>
                )
            )}
        </div>
    );
};

export default DialogueComponent;
