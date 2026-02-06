import { useEffect, useMemo, useState } from 'react';
import type { QuestState, QuestsDtoInner } from '../../common/api/.generated';
import { questsClient } from '../../common/api/client';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import { GameWindow } from '../../common/ui';
import { useGameStore } from '../game/GameStore';
import { GameView } from '../game/types';
import QuestItem from './components/QuestItem';
import style from './JournalComponent.module.scss';

const tabs: { state: QuestState; label: string }[] = [
    { state: 'In-progress', label: 'In Progress' },
    { state: 'On-hold', label: 'On Hold' },
    { state: 'Unlocked', label: 'Unlocked' },
    { state: 'Completed', label: 'Completed' },
    { state: 'Failed', label: 'Failed' },
];

const JournalComponent = () => {
    const { setView } = useGameStore();
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
        return quests?.reduce(
            (counts, quest) => {
                const lastState = quest.unlocked[quest.unlocked.length - 1].state;
                counts[lastState] = (counts[lastState] || 0) + 1;
                return counts;
            },
            {} as Record<QuestState, number>,
        );
    }, [quests]);

    const filteredQuests = useMemo(() => {
        return quests?.filter((quest) => quest.unlocked[quest.unlocked.length - 1].state === activeTab);
    }, [quests, activeTab]);

    if (!quests) {
        return (
            <GameWindow title="Journal" onClose={() => setView(GameView.World)} size="lg">
                <LoadingOverlay />
            </GameWindow>
        );
    }

    return (
        <GameWindow title="Journal" onClose={() => setView(GameView.World)} size="lg">
            <div className={style.tabsWrapper}>
                {tabs.map(({ state, label }) => (
                    <button
                        key={state}
                        onClick={() => setActiveTab(state)}
                        className={`${style.tabBtn} ${activeTab === state ? style.active : ''}`}>
                        {label}
                        {questCounts && questCounts[state] > 0 && (
                            <span className={style.count}>{questCounts[state]}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className={style.questsList}>
                {filteredQuests?.length === 0 && (
                    <p className={style.emptyMessage}>No quests in this category</p>
                )}
                {filteredQuests?.map((quest) => <QuestItem key={quest.label} quest={quest} />)}
            </div>
        </GameWindow>
    );
};

export default JournalComponent;
