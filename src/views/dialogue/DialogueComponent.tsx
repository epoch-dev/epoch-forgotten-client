import { useEffect, useState, KeyboardEvent, useRef } from 'react';
import { DialogueService } from './DialogueService';
import { NpcsClient } from '../../common/api/client';
import { DialogueNode } from '../../common/api/.generated';
import { DialogueComponentProps } from './types';
import style from './DialogueComponent.module.scss';

const DialogueComponent = ({ dialoguedName, onComplete }: DialogueComponentProps) => {
    const [service, setService] = useState<DialogueService>();
    const [currentNode, setCurrentNode] = useState<DialogueNode>();
    const [isComplete, setIsComplete] = useState(false);
    // const [isLastNode, setIsLastNode] = useState(false); // todo: would be useful?
    const [isLoading, setIsLoading] = useState(true);
    const [showOkButton, setShowOkButton] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ref.current?.focus();
    }, [isLoading])

    useEffect(() => {
        const fetchAndStartDialogue = async () => {
            setIsLoading(true);

            const npcDialogues = (await NpcsClient.getNpcDialogue(dialoguedName)).data;
            const newService = new DialogueService(npcDialogues, {
                onNodeChange:
                    (node) => {
                        setCurrentNode(node);
                        setShowOkButton(!(node && node.options));
                    },
                onComplete: () => setIsComplete(true),
            });
            newService.start();

            setService(newService);
            setIsLoading(false);
        }
        fetchAndStartDialogue();
    }, []);

    const handleOptionClick = async (optionIndex: number) => {
        await service?.handleUserInput(optionIndex);
    };

    const handleOkClick = async () => {
        if (!currentNode?.options) {
            service?.proceedToNextNode();
        }
    }

    const handleKeyPress = (event: KeyboardEvent) => {
        event.preventDefault();
        const pressedKey = event.key;
        if (pressedKey === ' ' || pressedKey === 'Spacebar') {
            event.preventDefault();
            handleOkClick();
        }
        else if (currentNode?.options && /^[1-9]$/.test(pressedKey)) {
            const keyIndex = parseInt(pressedKey, 10) - 1;
            handleOptionClick(keyIndex);
        }
    };

    if (isLoading) {
        return <div>Loading dialogue...</div>;
    }

    if (isComplete) {
        // todo: dialog with inventory (or any other) changes
        onComplete();
    }

    return (
        <div className={style.dialogueContainer} onKeyDown={handleKeyPress} tabIndex={-1} ref={ref}>
            {currentNode && (
                <div className={style.dialogueDialog}>
                    <p>{currentNode.author}: {currentNode.text}</p>
                    {currentNode.options && (
                        <>
                            <div>Options:</div>
                            {currentNode.options.map((option, index) => (
                                <div key={option.id}>
                                    <button
                                        key={option.id}
                                        onClick={() => handleOptionClick(index)}
                                    >
                                        {index + 1}: {option.text}
                                    </button>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            )}
            {showOkButton && (
                <button id='ok-button' onClick={handleOkClick}>OK</button>
            )}
        </div>
    );
};

export default DialogueComponent;
