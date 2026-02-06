import { CharacterDto } from '../../common/api/.generated';
import { AssetsService } from '../../common/services/AssetsService';
import { StatBar } from '../../common/ui';
import { AttributeComponent } from './AttributeComponent';
import style from './SkillsComponent.module.scss';

type CharacterSkillsPanelProps = {
    character: CharacterDto;
    onNavigateEquipment: () => void;
};

export const CharacterSkillsPanel = ({
    character,
    onNavigateEquipment,
}: CharacterSkillsPanelProps) => (
    <div className={style.characterPanel}>
        <div className={style.characterImage}>
            <img
                src={AssetsService.getCharacterUri(character.imageUri)}
                alt={character.label}
                draggable={false}
            />
        </div>
        <h3 className={style.characterName}>
            {character.label} <span>Lv.{character.level}</span>
        </h3>

        <div className={style.barsSection}>
            <StatBar
                current={character.statistics.health}
                max={character.statistics.maxHealth}
                type="health"
                showLabel
            />
            <StatBar
                current={character.statistics.mana}
                max={character.statistics.maxMana}
                type="mana"
                showLabel
            />
        </div>

        <div className={style.attributesSection}>
            <h4 className={style.sectionTitle}>Attributes</h4>
            <AttributeComponent label="Strength" amount={character.attributes.str} name="str" />
            <AttributeComponent label="Dexterity" amount={character.attributes.dex} name="dex" />
            <AttributeComponent label="Arcana" amount={character.attributes.arc} name="arc" />
            <AttributeComponent label="Poise" amount={character.attributes.poi} name="poi" />
        </div>

        <div className={style.pointsSection}>
            <div className={style.pointItem}>
                <span>Attribute Points</span>
                <b>{character.attributePoints}</b>
            </div>
            <div className={style.pointItem}>
                <span>Skill Points</span>
                <b>{character.skillPoints}</b>
            </div>
        </div>

        <button className={style.navBtn} onClick={onNavigateEquipment} title="Equipment">
            <img src={AssetsService.getIcon('EQUIPMENT')} alt="Equipment" draggable={false} />
            <span>Equipment</span>
        </button>
    </div>
);
