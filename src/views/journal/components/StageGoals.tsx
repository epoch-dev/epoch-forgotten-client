import style from '../JournalComponent.module.scss';
import type { QuestGoal } from '../../../common/api/.generated';
import StageProgress from './StageProgress';

const StageGoals = ({ goals, progresses }: { goals: QuestGoal[]; progresses: number[] | undefined }) => (
    <div className={style.goals}>
        <p className={style.goalsHeader}>Goals:</p>
        <ul className={style.goalsList}>
            {goals.map((goal, index) => (
                <StageProgress key={index} index={index} goal={goal} progresses={progresses} />
            ))}
        </ul>
    </div>
);

export default StageGoals;
