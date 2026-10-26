import { useEffect, useMemo, useState } from 'react';
import {
    getJournal,
    type QuestJournalEntryDto,
    QuestJournalEntryDtoStatus,
} from '../../common/api/.generated';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import { ToastService } from '../../common/services/ToastService';
import QuestItem from './components/QuestItem';
import style from './JournalComponent.module.scss';

const tabs: { status: QuestJournalEntryDtoStatus; label: string }[] = [
    { status: QuestJournalEntryDtoStatus.active, label: 'In Progress' },
    { status: QuestJournalEntryDtoStatus['on-hold'], label: 'On Hold' },
    { status: QuestJournalEntryDtoStatus.discovered, label: 'Discovered' },
    { status: QuestJournalEntryDtoStatus.completed, label: 'Completed' },
    { status: QuestJournalEntryDtoStatus.failed, label: 'Failed' },
];

const JournalComponent = () => {
    const [quests, setQuests] = useState<QuestJournalEntryDto[] | undefined>();
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string>();
    const [loadAttempt, setLoadAttempt] = useState(0);
    const [activeTab, setActiveTab] = useState<QuestJournalEntryDtoStatus>(
        QuestJournalEntryDtoStatus.active,
    );

    useEffect(() => {
        let cancelled = false;
        setIsLoading(true);
        setLoadError(undefined);

        const setupQuests = async () => {
            try {
                const questsResponse = await getJournal();
                if (!cancelled) {
                    setQuests(questsResponse);
                }
            } catch {
                if (!cancelled) {
                    const message = 'Unable to load journal.';
                    setLoadError(message);
                    ToastService.error({ message });
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        };

        void setupQuests();
        return () => {
            cancelled = true;
        };
    }, [loadAttempt]);

    const questCounts = useMemo(() => {
        return quests?.reduce(
            (counts, quest) => {
                counts[quest.status] = (counts[quest.status] || 0) + 1;
                return counts;
            },
            {} as Record<QuestJournalEntryDtoStatus, number>,
        );
    }, [quests]);

    const filteredQuests = useMemo(() => {
        return quests?.filter((quest) => quest.status === activeTab);
    }, [quests, activeTab]);

    if (isLoading) {
        return <LoadingOverlay />;
    }

    if (loadError || !quests) {
        return (
            <section className={style.errorState}>
                <p>{loadError ?? 'Unable to load journal.'}</p>
                <button type="button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>
                    Try again
                </button>
            </section>
        );
    }

    return (
        <section className={style.questsWrapper}>
            <div className={style.tabs}>
                {tabs.map(({ status, label }) => (
                    <button
                        key={status}
                        onClick={() => setActiveTab(status)}
                        className={activeTab === status ? style.active : ''}>
                        {label}
                        {(questCounts?.[status] ?? 0) > 0 && (
                            <span className={style.count}>{questCounts?.[status]}</span>
                        )}
                    </button>
                ))}
            </div>
            {filteredQuests?.map((quest) => (
                <QuestItem key={quest.questId} quest={quest} />
            ))}
        </section>
    );
};

export default JournalComponent;
