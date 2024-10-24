import style from './InfoPanel.module.scss';
import { useState } from "react";

const initialRoadmap: RoadmapMilestone[] = [
    { title: 'Prologue Release', description: 'Initial game release with core features.', status: 'Ready' },
    { title: 'Chapter 1 Development', description: 'Adding new areas and characters.', status: 'Developing' },
    { title: 'Mobile Support', description: 'Optimizing the game for mobile platforms.', status: 'Planning' },
];

type RoadmapMilestone = {
    title: string;
    description: string;
    status: 'Planning' | 'Developing' | 'Ready';
};

const InfoPanel = () => {
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const togglePanel = () => {
        setIsPanelOpen(!isPanelOpen);
    };

    return (
        <>
            <button className='panelBtn' style={{ top: '3rem' }} onClick={togglePanel}>
                Guide Post
            </button>
            {isPanelOpen && (
                <div className={style.infoPanel}>
                <h2 className={style.title}>Controls Tutorial</h2>
                <div className={style.section}>
                    <h3>Movement</h3>
                    <p>Use the <strong>Arrow Keys</strong> to move your character around the game world.</p>
                </div>
                <div className={style.section}>
                    <h3>Dialogues</h3>
                    <p>
                        You can interact with dialogues using:
                        <ul>
                            <li><strong>Mouse</strong> to select dialogue options</li>
                            <li><strong>Spacebar</strong> to progress through dialogue</li>
                            <li><strong>Number keys (1-9)</strong> to select dialogue options</li>
                        </ul>
                    </p>
                </div>
                <div className={style.roadmap}>
                        <h2 className={style.title}>Game Roadmap</h2>
                        {initialRoadmap.map((milestone, index) => (
                            <div className={style.milestone} key={index}>
                                <h3>{milestone.title}</h3>
                                <p>{milestone.description}</p>
                                <span className={style[milestone.status]}>
                                    {milestone.status}
                                </span>
                            </div>
                        ))}
                    </div>
            </div>
            )}
        </>
    );
};

export default InfoPanel;
