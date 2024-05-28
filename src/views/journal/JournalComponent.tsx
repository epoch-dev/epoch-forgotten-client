import style from './JournalComponent.module.scss';
import { useEffect, useState } from 'react';
import { questsClient } from '../../common/api/client';
import type { QuestsDtoInner } from '../../common/api/.generated';
import LoadingOverlay from '../../common/components/LoadingOverlay';
import QuestItem from './components/QuestItem';

const JournalComponent = () => {
    const [quests, setQuests] = useState<QuestsDtoInner[] | undefined>();

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

    return (
        <>
            <h1 className={style.header}>Journal</h1>
            <div className={style.questsWrapper}>
                {quests.map((quest) => (
                    <QuestItem key={quest.label} quest={quest} />
                ))}
            </div>
        </>
    );
};

export default JournalComponent;
