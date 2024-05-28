import style from '../JournalComponent.module.scss';
import type { QuestGoal } from "../../../common/api/.generated";

const StageProgress = ({
    index,
    progresses,
    goal,
}: {
    index: number;
    progresses: number[] | undefined;
    goal: QuestGoal;
}) => {
    const progress = progresses ? progresses[index] : 0;
    return (
        <li key={index} className={style.goalItem}>
            {goal.type}: {goal.label} (Progress: {progress}/{goal.target})
        </li>
    );
};

export default StageProgress;
