import style from './JournalComponent.module.scss';
import { useEffect, useState } from 'react';
import { questsClient } from '../../common/api/client';
import { QuestsDtoInner } from '../../common/api/.generated';
import LoadingOverlay from '../../common/components/LoadingOverlay';

const JournalComponent = () => {
    const [quests, setQuests] = useState<QuestsDtoInner[] | undefined>();

    useEffect(() => {
        void setupQuests();
    }, []);

    const setupQuests = async () => {
        const questsResponse = await questsClient.getUnlockedQuests();
        setQuests(questsResponse.data);
    };

    return (
        <>
            <h1 className={style.header}>Journal</h1>
            <div className={style.questsWrapper}>
                {!quests ? <LoadingOverlay /> : quests.map((quest) => (
                    <div key={quest.label} className={`${style.questItem} ${quest.main ? style.mainQuest : ''}`}>
                        <p className={`${style.subtitle} dark`}>{quest.label}</p>
                        {quest.stages.map((stage) => {
                            const unlockedEntity = quest.unlocked.find(entity => entity.id === stage.id);
                            return (
                                <div key={stage.id} className={style.stageItem}>
                                    <p className={style.objective}>{stage.objective}</p>
                                    <p className={style.description}>
                                        {stage.description}
                                    </p>
                                    {stage.goals && (
                                        <div className={style.goals}>
                                            <p className={style.goalsHeader}>Goals:</p>
                                            <ul className={style.goalsList}>
                                                {stage.goals.map((goal, index) => {
                                                    const progress = unlockedEntity?.progresses ? unlockedEntity.progresses[index] : 0;
                                                    return (
                                                        <li key={index} className={style.goalItem}>
                                                            {goal.type}: {goal.label} (Progress: {progress}/{goal.target})
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        </div>
                                    )}
                                    {stage.rewards && (
                                        <p className={style.rewards}>
                                            Rewards: {stage.rewards?.gold && `${stage.rewards.gold} Gold, `}
                                            {stage.rewards?.exp && `${stage.rewards.exp} Exp`}
                                        </p>
                                    )}
                                    <p className={`${style.state} ${style[unlockedEntity!.state]}`}>
                                        {unlockedEntity!.state}
                                    </p>
                                </div>
                            )
                        })}
                    </div>
                ))}
            </div>
        </>
    );
};

export default JournalComponent;
