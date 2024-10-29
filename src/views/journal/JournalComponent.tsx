import style from './JournalComponent.module.scss';
import { useEffect, useMemo, useState } from 'react';
import { questsClient } from '../../common/api/client';
import type { QuestState, QuestsDtoInner } from '../../common/api/.generated';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import QuestItem from './components/QuestItem';

const tabs: { state: QuestState; label: string }[] = [
    { state: 'In-progress', label: 'In Progress' },
    { state: 'On-hold', label: 'On Hold' },
    { state: 'Unlocked', label: 'Unlocked' },
    { state: 'Completed', label: 'Completed' },
    { state: 'Failed', label: 'Failed' }
];

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

    const questCounts = useMemo(() => {
        return quests?.reduce((counts, quest) => {
            const lastState = quest.unlocked[quest.unlocked.length - 1].state;
            counts[lastState] = (counts[lastState] || 0) + 1;
            return counts;
        }, {} as Record<QuestState, number>);
    }, [quests]);
    
    const filteredQuests = useMemo(() => {
        return quests?.filter(quest => quest.unlocked[quest.unlocked.length - 1].state === activeTab);
    }, [quests, activeTab]);

    if (!quests) {
        return <LoadingOverlay />;
    }
    
    return (
        <section className={style.questsWrapper}>
            <div className={style.tabs}>
                {tabs.map(({state, label}) => (
                    <button
                        key={state}
                        onClick={() => setActiveTab(state)}
                        className={activeTab === state ? style.active : ''}
                    >
                        {label}
                        {questCounts![state] > 0 && (
                            <span className={style.count}>{questCounts![state]}</span>
                        )}
                    </button>
                ))}
            </div>
            {filteredQuests!.map((quest) => (
                <QuestItem key={quest.label} quest={quest} />
            ))}
        </section>
    );
};

export default JournalComponent;
