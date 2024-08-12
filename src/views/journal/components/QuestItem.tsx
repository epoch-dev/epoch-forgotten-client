import style from '../JournalComponent.module.scss';
import type { QuestsDtoInner } from '../../../common/api/.generated';
import StageItem from './StageItem';

const QuestItem = ({ quest }: { quest: QuestsDtoInner }) => {
    return (
        <details className={`${style.questItem} ${quest.main ? style.mainQuest : ''}`}>
            <summary className={`${style.subtitle} action dark`}>
                {quest.label}
            </summary>
            <div className={style.stagesWrapper}>
                {quest.stages.map((stage) => (
                    <StageItem key={stage.id} stage={stage} unlocked={quest.unlocked} />
                ))}
            </div>
        </details>
    );
};

export default QuestItem;
