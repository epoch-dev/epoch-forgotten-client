import style from './DialogueComponent.module.scss';
import { useEffect, useState } from 'react';
import { DialogueService } from './DialogueService';
import { NpcsClient } from '../../common/api/client';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import { DialogueNode } from '../../common/api/.generated';

const DialogueComponent = () => {
    const { npc, setView } = useGameStore();
    const [currentNode, setCurrentNode] = useState<DialogueNode>();
    const [showOkButton, setShowOkButton] = useState(false);

    useEffect(() => {
        const fetchAndStartDialogue = async () => {
            if (!npc) {
                setView(GameView.World);
                return;
            }
            const npcDialogues = (await NpcsClient.getNpcDialogue(npc.npcName)).data;
            DialogueService.setup(npc.npcName, npcDialogues, {
                onNodeChange: (node) => {
                    setShowOkButton(!(node && node.options));
                    setCurrentNode(node);
                },
                onComplete: () => {
                    setView(GameView.World);
                    window.removeEventListener('keydown', handleKeyPress, true);
                },
            });
            DialogueService.start();
            window.addEventListener('keydown', handleKeyPress, true);
        };

        fetchAndStartDialogue();

        return () => {
            window.removeEventListener('keydown', handleKeyPress, true);
        };
    }, [npc, setView]);

    const handleOptionClick = async (optionIndex: number) => {
        await DialogueService.handleUserInput(optionIndex);
    };

    const handleOkClick = async () => {
        if (!DialogueService.getCurrentNode()?.options) {
            DialogueService.proceedToNextNode();
        }
    };

    const handleKeyPress = (event: KeyboardEvent) => {
        const pressedKey = event.key;
        if (pressedKey === ' ' || pressedKey === 'Spacebar') {
            handleOkClick();
        } else if (DialogueService.getCurrentNode()?.options && /^[1-9]$/.test(pressedKey)) {
            const keyIndex = parseInt(pressedKey, 10) - 1;
            handleOptionClick(keyIndex);
        }
    };

    return (
        <div className={style.dialogueWrapper}>
            {currentNode && (
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
            )}
        </div>
    );
};

export default DialogueComponent;
