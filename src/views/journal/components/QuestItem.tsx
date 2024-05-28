import style from '../JournalComponent.module.scss';
import type { QuestsDtoInner } from '../../../common/api/.generated';
import StageItem from './StageItem';

const QuestItem = ({ quest }: { quest: QuestsDtoInner }) => (
    <div className={`${style.questItem} ${quest.main ? style.mainQuest : ''}`}>
        <p className={`${style.subtitle} dark`}>{quest.label}</p>
        {quest.stages.map((stage) => (
            <StageItem key={stage.id} stage={stage} unlocked={quest.unlocked} />
        ))}
    </div>
);

export default QuestItem;
