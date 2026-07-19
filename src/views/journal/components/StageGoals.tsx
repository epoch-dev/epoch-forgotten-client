import type { QuestJournalGoalDto } from '../../../common/api/.generated';
import style from '../JournalComponent.module.scss';

const StageGoals = ({ goals }: { goals: readonly QuestJournalGoalDto[] }) => {
    return (
        <div className={style.goals}>
            <p className={style.goalsHeader}>Goals:</p>
            <ul className={style.goalsList}>
                {goals.map((goal) => (
                    <li key={goal.id} className={style.goalItem}>
                        {goal.kind}: {goal.label} (Progress: {goal.progress}/{goal.target})
                        {goal.complete ? ' [complete]' : ''}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default StageGoals;
