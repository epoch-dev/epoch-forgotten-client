import type { QuestJournalEntryDto } from '../../../common/api/.generated';
import { QuestJournalEntryDtoStatusEnum } from '../../../common/api/.generated';
import style from '../JournalComponent.module.scss';
import StageItem from './StageItem';

const QuestItem = ({ quest }: { quest: QuestJournalEntryDto }) => {
    const isDiscovered = quest.status === QuestJournalEntryDtoStatusEnum.Discovered;
    const currentStage =
        quest.currentStageId !== undefined
            ? quest.stages.find((stage) => stage.id === quest.currentStageId)
            : undefined;
    const historyStages = quest.stages;

    return (
        <details className={`${style.questItem} ${quest.main ? style.mainQuest : ''}`}>
            <summary className={`${style.subtitle} action dark`}>{quest.label}</summary>
            {isDiscovered ? (
                <p className={style.description}>{quest.journalHint}</p>
            ) : (
                <div className={style.stagesWrapper}>
                    {(quest.status === QuestJournalEntryDtoStatusEnum.Active ||
                    quest.status === QuestJournalEntryDtoStatusEnum.OnHold
                        ? currentStage
                            ? [currentStage]
                            : []
                        : historyStages
                    ).map((stage) => (
                        <StageItem key={stage.id} stage={stage} questStatus={quest.status} />
                    ))}
                </div>
            )}
        </details>
    );
};

export default QuestItem;
