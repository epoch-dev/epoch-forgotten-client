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
            {stage.effects && (
                <p className={style.rewards}>
                    Rewards: {stage.effects?.gold && `${stage.effects.gold} Gold, `}
                    {stage.effects?.exp && `${stage.effects.exp} Exp`}
                </p>
            )}
            <p className={`${style.state} ${style[unlockedEntity?.state ?? '']}`}>{unlockedEntity?.state}</p>
        </div>
    );
};

export default StageItem;
