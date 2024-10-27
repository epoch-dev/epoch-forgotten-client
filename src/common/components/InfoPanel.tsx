import style from './InfoPanel.module.scss';
import { useState } from 'react';
import { TooltipComponent } from './TooltipComponent';

// const roadmap: RoadmapMilestone[] = [
//     { title: 'Prologue Release', description: 'Initial game release with core features.', status: 'Ready' },
//     { title: 'Chapter 1 Development', description: 'Adding new areas and characters.', status: 'Developing' },
//     { title: 'Mobile Support', description: 'Optimizing the game for mobile platforms.', status: 'Planning' },
// ];

// type RoadmapMilestone = {
//     title: string;
//     description: string;
//     status: 'Planning' | 'Developing' | 'Ready';
// };

const InfoPanel = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    return (
        <>
            <button className="panelBtn" style={{ top: '3rem' }} onClick={togglePanel}>
                Instructions
            </button>
            {isPanelOpen && (
                <aside className={style.infoPanel}>
                    <h2 className="subtitle left primary">Game Controls</h2>
                    <hr />
                    <section className={style.section}>
                        <h3>Movement</h3>
                        <span>
                            Use the <strong>Arrow Keys</strong> to move your character around the game world.
                            Different actions will occur based on the tile type:
                        </span>
                        <TooltipComponent hint="Monsters may attack while traversing these areas">
                            <p className="inline route" style={{ marginLeft: '0.9rem' }}>
                                •
                            </p>
                            Unsafe route
                        </TooltipComponent>
                        <TooltipComponent hint="Areas impossible to explore">
                            <p className="inline collision" style={{ marginLeft: '0.9rem' }}>
                                •
                            </p>
                            Unreachable area
                        </TooltipComponent>
                        <TooltipComponent hint="Interaction with non-player character, quests and shops can be accessed from here">
                            <p className="inline npc">∎</p>NPC
                        </TooltipComponent>
                        <TooltipComponent hint="Passage to a nearby location">
                            <p className="inline passage">∎</p>Passage
                        </TooltipComponent>
                        <TooltipComponent hint="Initiates combat with a powerful enemy with limited availability">
                            <p className="inline encounter">∎</p>Great danger
                        </TooltipComponent>
                    </section>
                    <hr />
                    <section className={style.section}>
                        <h3>Dialogues</h3>
                        <span>You can interact with dialogues using:</span>
                        <ul>
                            <li>
                                <strong>Mouse</strong> to select dialogue options
                            </li>
                            <li>
                                <strong>Spacebar</strong> to progress through dialogue
                            </li>
                            <li>
                                <strong>Number keys (1-9)</strong> to select dialogue options
                            </li>
                        </ul>
                    </section>
                    <hr />
                    <section className={style.section}>
                        <h3>Battles</h3>
                        <ul>
                            <li>
                                Battles are executed in a <b>turn-based</b> system
                            </li>
                            <li>
                                For each turn you need to select character, choose skill and mark the target
                                using your mouse
                            </li>
                            <li>
                                After all decisions are made you can click on the <b>Attack</b> button to
                                start turn execution
                            </li>
                            <li>
                                Your choices are remembered in a scope of a single battle, but you need to
                                ensure the target is still alive and your characters have enough mana to
                                perform selected skill
                            </li>
                            <li>You can hover-over characters to see more information.</li>
                            <li>
                                You can try to escape from a battle using the <b>Run</b> button, but if you
                                fail your characters will not act during this turn
                            </li>
                        </ul>
                    </section>
                </aside>
            )}
        </>
    );
};

export default InfoPanel;
