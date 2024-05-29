import style from '../JournalComponent.module.scss';
import type { QuestGoal } from '../../../common/api/.generated';

const StageGoals = ({ goals, progresses }: { goals: QuestGoal[]; progresses: number[] | undefined }) => {
    const StageProgress = ({ index, goal }: { index: number; goal: QuestGoal }) => {
        const progress = progresses ? progresses[index] : 0;
        return (
            <li key={index} className={style.goalItem}>
                {goal.type}: {goal.label} (Progress: {progress}/{goal.target})
            </li>
        );
    };

    return (
        <div className={style.goals}>
            <p className={style.goalsHeader}>Goals:</p>
            <ul className={style.goalsList}>
                {goals.map((goal, index) => (
                    <StageProgress key={index} index={index} goal={goal} />
                ))}
            </ul>
        </div>
    )
};

export default StageGoals;
