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
                    <b>Rewards:</b>
                    {stage.effects.gold && ` ${stage.effects.gold} Gold${stage.effects.gold ? ', ' : ''}`}
                    {stage.effects.exp &&
                        ` ${stage.effects.exp} Exp${stage.effects.items?.length ? ', ' : ''}`}
                    {stage.effects.items
                        ?.map((item) => `${item.label ?? item.name} (${item.quantity})`)
                        .join(', ')}
                </p>
            )}
            <p className={`${style.state} ${style[unlockedEntity?.state ?? '']}`}>{unlockedEntity?.state}</p>
        </div>
    );
};

export default StageItem;
