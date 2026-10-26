import type { QuestJournalEntryDto } from '../../../common/api/.generated';
import { QuestJournalEntryDtoStatus } from '../../../common/api/.generated';
import style from '../JournalComponent.module.scss';
import StageGoals from './StageGoals';

const QuestItem = ({ quest }: { quest: QuestJournalEntryDto }) => {
    const isDiscovered = quest.status === QuestJournalEntryDtoStatus.discovered;
    const showsCurrentStageOnly =
        quest.status === QuestJournalEntryDtoStatus.active ||
        quest.status === QuestJournalEntryDtoStatus['on-hold'];
    const stages = showsCurrentStageOnly
        ? quest.stages.filter((stage) => stage.id === quest.currentStageId)
        : quest.stages;

    return (
        <details className={`${style.questItem} ${quest.main ? style.mainQuest : ''}`}>
            <summary className={`${style.subtitle} action dark`}>{quest.label}</summary>
            {isDiscovered ? (
                <p className={style.description}>{quest.journalHint}</p>
            ) : (
                <div className={style.stagesWrapper}>
                    {stages.map((stage) => (
                        <div key={stage.id} className={style.stageItem}>
                            <p className={style.objective}>{stage.objective}</p>
                            <p className={style.description}>{stage.description}</p>
                            {quest.status === QuestJournalEntryDtoStatus.active &&
                                stage.goals.length > 0 && <StageGoals goals={stage.goals} />}
                            <p className={`${style.state} ${style[stage.status]}`}>{stage.status}</p>
                        </div>
                    ))}
                </div>
            )}
        </details>
    );
};

export default QuestItem;
