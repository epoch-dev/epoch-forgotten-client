import { CharacterDto } from '../../common/api/.generated';
import { AssetsService } from '../../common/services/AssetsService';
import { StatBar } from '../../common/ui';
import style from './EquipmentComponent.module.scss';

type CharacterStatsPanelProps = {
    character: CharacterDto;
    equipmentWeight: number;
};

export const CharacterStatsPanel = ({ character, equipmentWeight }: CharacterStatsPanelProps) => (
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
        <p className={style.characterClass}>{character.class}</p>

        <div className={style.statsSection}>
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

        <div className={style.statsGrid}>
            <StatRow label="P. Attack" value={character.statistics.pAtk} />
            <StatRow label="M. Attack" value={character.statistics.mAtk} />
            <StatRow label="P. Defense" value={character.statistics.pDef} />
            <StatRow label="M. Defense" value={character.statistics.mDef} />
            <StatRow label="Speed" value={character.statistics.speed} />
            <StatRow label="Dodge" value={`${(100 * character.statistics.dodgeChance).toFixed(0)}%`} />
            <StatRow label="Crit Chance" value={`${(100 * character.statistics.critChance).toFixed(0)}%`} />
            <StatRow label="Crit Power" value={`${(100 * character.statistics.critPower).toFixed(0)}%`} />
        </div>

        <div className={style.weightDisplay}>
            Weight: <b>{equipmentWeight}</b>
        </div>
    </div>
);

const StatRow = ({ label, value }: { label: string; value: string | number }) => (
    <div className={style.statRow}>
        <span className={style.statLabel}>{label}</span>
        <span className={style.statValue}>{value}</span>
    </div>
);
