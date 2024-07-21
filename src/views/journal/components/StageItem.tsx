import style from '../JournalComponent.module.scss';
import type { QuestStage, QuestUnlockedEntity } from '../../../common/api/.generated';
import StageGoals from './StageGoals';

const StageItem = ({ stage, unlocked }: { stage: QuestStage; unlocked: QuestUnlockedEntity[] }) => {
    const unlockedEntity = unlocked.find((entity) => entity.id === stage.id);
    return (
        <div className={style.stageItem}>
            <p className={style.objective}>{stage.objective}</p>
            <p className={style.description}>{stage.description}</p>
            {stage.goals && unlockedEntity?.state === 'In-progress' && (
                <StageGoals goals={stage.goals} progresses={unlockedEntity?.progresses} />
            )}
            {stage.rewards && (
                <p className={style.rewards}>
                    Rewards: {stage.rewards?.gold && `${stage.rewards.gold} Gold, `}
                    {stage.rewards?.exp && `${stage.rewards.exp} Exp`}
                </p>
            )}
            <p className={`${style.state} ${style[unlockedEntity?.state ?? '']}`}>{unlockedEntity?.state}</p>
        </div>
    );
};

export default StageItem;
