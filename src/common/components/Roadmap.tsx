import style from './Roadmap.module.scss';

type RoadmapProps = {
    onClose: () => void;
};

type RoadmapMilestone = {
    title: string;
    date?: string;
    description: string;
    status: 'Planning' | 'Developing' | 'Ready';
};

const ROADMAP: RoadmapMilestone[] = [
    {
        title: 'Core Mechanics',
        date: '01.10.2024',
        description:
            'Internal release featuring account creation, characters management, map movement, battles, NPCs & quests and inventory.',
        status: 'Ready',
    },
    {
        title: 'First Chapter of the Main Story',
        date: '11.11.2024',
        description:
            'First part of the Epoch Forgotten adventure featuring main cast, starting location, main cast, early-game enemies and some side stories to explore.',
        status: 'Ready',
    },
    {
        title: 'Second Chapter of the Main Story',
        date: '',
        description: 'Adding the main story continuation with new locations, characters, enemies and items.',
        status: 'Planning',
    },
    {
        title: 'Extended Battle Mechanics',
        date: '',
        description: 'More battle effects & statuses, flexible characters size, simpler controls.',
        status: 'Planning',
    },
    // { title: 'Mobile Support', description: 'Dedicated app for mobile platform', status: 'Planning' },
];

export const Roadmap = ({ onClose }: RoadmapProps) => {
    return (
        <div className={style.modalBackdrop}>
            <section className={style.modalWrapper}>
                <h2 className="subtitle primary">Roadmap</h2>
                {ROADMAP.map((milestone) => (
                    <div key={milestone.title} className={style.milestoneItem}>
                        <h3>
                            {milestone.title} ({milestone.status})
                        </h3>
                        {milestone.date && <p className={style.dateLabel}>{milestone.date}</p>}
                        <hr />
                        <p>{milestone.description}</p>
                    </div>
                ))}
                <button onClick={onClose} className="btn">
                    Close
                </button>
            </section>
        </div>
    );
};
