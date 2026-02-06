import { SkillDto } from '../../common/api/.generated';
import { SkillComponent } from './SkillComponent';
import style from './SkillsComponent.module.scss';

type SkillTreesPanelProps = {
    characterClass: string;
    classSkills?: SkillDto[];
    uniqueSkills?: SkillDto[];
};

export const SkillTreesPanel = ({
    characterClass,
    classSkills,
    uniqueSkills,
}: SkillTreesPanelProps) => (
    <div className={style.treesPanel}>
        <div className={style.skillTreesWrapper}>
            {/* Class Skills */}
            <div className={style.skillTree}>
                <h4 className={style.treeTitle}>{characterClass}</h4>
                <div className={style.skillsList}>
                    {classSkills?.map((skill, index) => (
                        <div key={skill.name} className={style.skillNode}>
                            <SkillComponent skill={skill} />
                            {index < classSkills.length - 1 && <div className={style.connector} />}
                        </div>
                    ))}
                </div>
            </div>

            {/* Unique/Bloodline Skills */}
            <div className={style.skillTree}>
                <h4 className={style.treeTitle}>Bloodline</h4>
                <div className={style.skillsList}>
                    {uniqueSkills?.map((skill, index) => (
                        <div key={skill.name} className={style.skillNode}>
                            <SkillComponent skill={skill} />
                            {index < uniqueSkills.length - 1 && <div className={style.connector} />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </div>
);
