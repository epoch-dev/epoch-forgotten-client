import style from './JournalComponent.module.scss';
import { useEffect, useState } from 'react';
import { questsClient } from '../../common/api/client';
import { QuestGoal, QuestStage, QuestUnlockedEntity, QuestsDtoInner } from '../../common/api/.generated';
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

    const StageProgress = ({ index, progresses, goal }: { index: number; progresses: number[] | undefined; goal: QuestGoal }) => {
        const progress = progresses ? progresses[index] : 0;
        return (
            <li key={index} className={style.goalItem}>
                {goal.type}: {goal.label} (Progress: {progress}/{goal.target})
            </li>
        );
    }

    const StageGoals = ({ goals, progresses }: { goals: QuestGoal[]; progresses: number[] | undefined; }) => (
        <div className={style.goals}>
            <p className={style.goalsHeader}>Goals:</p>
            <ul className={style.goalsList}>
                {goals.map((goal, index) => (
                    <StageProgress index={index} goal={goal} progresses={progresses} />
                ))}
            </ul>
        </div>
    )

    const StageItem = ({ stage, unlocked }: { stage: QuestStage; unlocked: QuestUnlockedEntity[] }) => {
        const unlockedEntity = unlocked.find(entity => entity.id === stage.id);
        return (
            <div className={style.stageItem}>
                <p className={style.objective}>{stage.objective}</p>
                <p className={style.description}>{stage.description}</p>
                {stage.goals && <StageGoals goals={stage.goals} progresses={unlockedEntity?.progresses} />}
                {stage.rewards && (
                    <p className={style.rewards}>
                        Rewards: {stage.rewards?.gold && `${stage.rewards.gold} Gold, `}
                        {stage.rewards?.exp && `${stage.rewards.exp} Exp`}
                    </p>
                )}
                <p className={`${style.state} ${style[unlockedEntity?.state ?? '']}`}>
                    {unlockedEntity?.state}
                </p>
            </div>
        );
    };

    const QuestItem = ({ quest }: { quest: QuestsDtoInner }) => {
        return (
            <div className={`${style.questItem} ${quest.main ? style.mainQuest : ''}`}>
                <p className={`${style.subtitle} dark`}>{quest.label}</p>
                {quest.stages.map((stage) => (
                    <StageItem key={stage.id} stage={stage} unlocked={quest.unlocked} />
                ))}
            </div>
        );
    };

    return (
        <>
            <h1 className={style.header}>Journal</h1>
            <div className={style.questsWrapper}>
                {!quests ? (
                    <LoadingOverlay />
                ) : (
                    quests.map((quest) => (
                        <QuestItem key={quest.label} quest={quest} />
                    ))
                )}
            </div>
        </>
    );
};

export default JournalComponent;
