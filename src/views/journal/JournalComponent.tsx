import style from './JournalComponent.module.scss';
import { useEffect, useState } from 'react';
import { questsClient } from '../../common/api/client';
import type { QuestState, QuestsDtoInner } from '../../common/api/.generated';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import QuestItem from './components/QuestItem';

const JournalComponent = () => {
    const [quests, setQuests] = useState<QuestsDtoInner[] | undefined>();
    const [activeTab, setActiveTab] = useState<QuestState>('In-progress');

    useEffect(() => {
        void setupQuests();
    }, []);

    const setupQuests = async () => {
        const questsResponse = await questsClient.getUnlockedQuests();
        setQuests(questsResponse.data);
    };

    if (!quests) {
        return <LoadingOverlay />;
    }

    const filteredQuests = quests.filter(quest => quest.unlocked[quest.unlocked.length - 1].state === activeTab);

    return (
        <section className={style.questsWrapper}>
            <div className={style.tabs}>
                <button onClick={() => setActiveTab('In-progress')} className={activeTab === 'In-progress' ? style.active : ''}>In Progress</button>
                <button onClick={() => setActiveTab('Unlocked')} className={activeTab === 'Unlocked' ? style.active : ''}>Unlocked</button>
                <button onClick={() => setActiveTab('Completed')} className={activeTab === 'Completed' ? style.active : ''}>Completed</button>
            </div>
            {filteredQuests.map((quest) => (
                <QuestItem key={quest.label} quest={quest} />
            ))}
        </section>
    );
};

export default JournalComponent;
