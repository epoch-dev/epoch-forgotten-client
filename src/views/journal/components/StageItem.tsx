import type {
    QuestJournalEntryDtoStatusEnum,
    QuestJournalStageDto,
} from '../../../common/api/.generated';
import { QuestJournalEntryDtoStatusEnum as QuestStatus } from '../../../common/api/.generated';
import style from '../JournalComponent.module.scss';
import StageGoals from './StageGoals';

const StageItem = ({
    stage,
    questStatus,
}: {
    stage: QuestJournalStageDto;
    questStatus: QuestJournalEntryDtoStatusEnum;
}) => {
    const showGoals = questStatus === QuestStatus.Active && stage.goals.length > 0;

    return (
        <div className={style.stageItem}>
            <p className={style.objective}>{stage.objective}</p>
            <p className={style.description}>{stage.description}</p>
            {showGoals && <StageGoals goals={stage.goals} />}
            <p className={`${style.state} ${style[stage.status]}`}>{stage.status}</p>
        </div>
    );
};

export default StageItem;
