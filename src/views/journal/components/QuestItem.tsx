import style from '../JournalComponent.module.scss';
import type { QuestsDtoInner } from '../../../common/api/.generated';
import StageItem from './StageItem';
import { useState } from 'react';

const QuestItem = ({ quest }: { quest: QuestsDtoInner }) => {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className={`${style.questItem} ${quest.main ? style.mainQuest : ''}`}>
            <div>
                <p onClick={() => setExpanded(!expanded)} className={`${style.subtitle} action dark`}>
                    {expanded ? '◀' : '▶'} {quest.label}
                </p>
            </div>
            {expanded && (
                <div className={style.stagesWrapper}>
                    {quest.stages.map((stage) => (
                        <StageItem key={stage.id} stage={stage} unlocked={quest.unlocked} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default QuestItem;
