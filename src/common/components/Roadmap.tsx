import style from './Roadmap.module.scss';

type RoadmapProps = {
    onClose: () => void;
};

type RoadmapMilestone = {
    title: string;
    date: string;
    description: string;
    status: 'Planning' | 'Developing' | 'Ready';
};

const ROADMAP: RoadmapMilestone[] = [
    {
        title: 'Core Mechanics',
        date: '01.10.2024',
        description:
            'Internal release featuring account creation, characters management, map movement, battles, NPCs, quests, shops and inventory.',
        status: 'Ready',
    },
    {
        title: 'First Chapter of the Main Story',
        date: '11.11.2024',
        description:
            'First part of the Epoch Forgotten adventure featuring main cast, starting location, early-game enemies and side stories to explore.',
        status: 'Ready',
    },
    {
        title: 'Battles Expansion',
        date: 'early December',
        description: 'More battle effects & statuses, flexible characters size, more flexible controls.',
        status: 'Developing',
    },
    {
        title: 'Second Chapter of the Main Story',
        date: 'early January',
        description: 'Adding the main story continuation with new locations, characters, enemies and items.',
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
                        <h3>{milestone.title}</h3>
                        <p className={style.dateLabel}>
                            <span className={style[milestone.status]}>{milestone.status}</span> |{' '}
                            {milestone.date}
                        </p>
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
