import style from './JournalComponent.module.scss';
import { useEffect, useState } from 'react';
import { questsClient } from '../../common/api/client';
import { QuestsDtoInner } from '../../common/api/.generated';

const JournalComponent = () => {
    const [quests, setQuests] = useState<QuestsDtoInner[]>([]);

    useEffect(() => {
        void setupQuests();
    }, []);

    const setupQuests = async () => {
        const questsData = await questsClient.getUnlockedQuests();
        setQuests(questsData.data);
    };

    return (
        <>
            <h1>Journal</h1>
            <div className={style.questsWrapper}>
                {quests.map((quest) => (
                    <div className={style.questItem}>
                        <p className="subtitle dark">{quest.label}</p>
                        {quest.stages.map((stage, stageInd) => (
                            <>
                                <i className={`${stageInd === quest.stages.length - 1 ? 'bold' : ''}`}>
                                    {stage.description}
                                </i>
                                <p>Rewards: {stage.rewards?.exp + 'Exp'}</p>
                            </>
                        ))}
                    </div>
                ))}
            </div>
            <p>{JSON.stringify(quests)}</p>
        </>
    );
};

export default JournalComponent;
