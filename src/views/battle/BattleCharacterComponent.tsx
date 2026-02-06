import { useEffect, useState } from 'react';
import { BattleCharacter, BattleMoveResult, BattleStatus } from '../../common/api/.generated';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { SoundService } from '../../common/services/SoundService';
import { StatBar } from '../../common/ui';
import { formatNumber, generateRandomId } from '../../common/utils';
import style from './BattleCharacterComponent.module.scss';

const soundService = SoundService.getInstance();

const DEFAULT_SIZE = 64;
const WIDTH_FACTOR = 1.1;
const HEIGHT_FACTOR = 1.3;

type BattleCharacterProps = {
    character: BattleCharacter;
    isSelected: boolean;
    isTargeted: boolean;
    isDefaultTargeted?: boolean;
    animatedSkill: BattleMoveResult | undefined;
    onClick: () => void;
};

export const BattleCharacterComponent = ({
    character,
    isSelected,
    isTargeted,
    isDefaultTargeted,
    animatedSkill,
    onClick,
}: BattleCharacterProps) => {
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (animatedSkill && animatedSkill.characterId === character.id) {
            soundService.play(`skills/${animatedSkill.skillSoundUri}`);
            setAnimating(true);
        } else {
            setAnimating(false);
        }
    }, [animatedSkill, character.id]);

    const characterClass = [
        style.characterItem,
        character.isControlled && style.characterAlly,
        isTargeted && style.targetActive,
        isDefaultTargeted && style.targetDefaultActive,
        isSelected && style.characterActive,
        !character.isAlive && style.characterDead,
        animating && (character.isControlled ? style.allyAttacking : style.enemyAttacking),
    ]
        .filter(Boolean)
        .join(' ');

    const characterImgUri = character.isControlled
        ? AssetsService.getCharacterUri(character.imageUri)
        : AssetsService.getEnemyUri(character.imageUri);

    const animatedLog = animatedSkill?.moveLogs.find((log) => log.targetId === character.id);

    // Use size from character if available, otherwise default
    const charSize = (character as BattleCharacter & { size?: number }).size ?? DEFAULT_SIZE;
    const imgWidth = WIDTH_FACTOR * charSize;
    const imgHeight = HEIGHT_FACTOR * charSize;

    return (
        <TooltipComponent
            hint={
                <div className={style.tooltipItem}>
                    <p className="subtitle">{character.label}</p>
                    {character.title && <p className="bold mythical">*{character.title}*</p>}
                    {character.race && <p>{character.race}</p>}

                    {character.isControlled && (
                        <div>
                            <hr />
                            <p>
                                {character.statistics.health} / {character.statistics.maxHealth} HP
                            </p>
                            <p>
                                {character.statistics.mana} / {character.statistics.maxMana} MP
                            </p>
                        </div>
                    )}

                    {character.statistics.statuses.length > 0 && (
                        <BattleCharacterStatus statuses={character.statistics.statuses} />
                    )}

                    <hr />
                    <p>
                        Power level:
                        {character.statistics.powerLevel
                            ? ` ${formatNumber(character.statistics.powerLevel)}`
                            : ' ???'}
                    </p>
                </div>
            }>
            <div onClick={onClick} className={characterClass}>
                {/* Skill usage log */}
                {animatedSkill?.characterId === character.id && (
                    <div className={style.logItem}>
                        <p>{animatedSkill.skillLabel}</p>
                        {animatedSkill.statusLogs.map((statusLog) => (
                            <p key={generateRandomId()} className={style.logItemStatus}>
                                -{statusLog.value} ({statusLog.label})
                            </p>
                        ))}
                    </div>
                )}

                {/* Damage/heal received log */}
                {animatedLog &&
                    animatedLog.hits.map((hit, hitIndex) => (
                        <div
                            key={generateRandomId()}
                            className={style.logItem}
                            style={{ animationDelay: `${hitIndex / 2}s` }}>
                            <b className={hit.value >= 0 ? 'error' : 'success'}>
                                {formatNumber(Math.round(Math.abs(hit.value)))}
                                {hit.effectLogs.map((effectLog) => (
                                    <p key={generateRandomId()} className={style.effectLogItem}>
                                        {effectLog}
                                    </p>
                                ))}
                            </b>
                        </div>
                    ))}

                {/* Character image */}
                <div className={style.imageWrapper}>
                    <img
                        src={characterImgUri}
                        alt={character.label}
                        style={{
                            width: `${imgWidth}px`,
                            height: `${imgHeight}px`,
                            animationDuration: `${charSize / 20}s`,
                        }}
                    />
                </div>

                {/* HP/Mana bars */}
                <div className={style.statsWrapper} style={{ width: `${imgWidth}px` }}>
                    <StatBar
                        current={character.statistics.health}
                        max={character.statistics.maxHealth}
                        type="health"
                    />
                    {character.isControlled && (
                        <StatBar
                            current={character.statistics.mana}
                            max={character.statistics.maxMana}
                            type="mana"
                        />
                    )}
                </div>
            </div>
        </TooltipComponent>
    );
};

const BattleCharacterStatus = ({ statuses }: { statuses: BattleStatus[] }) => {
    const statusModifiers: { key: keyof BattleStatus; label: string | ((amount: number) => string) }[] = [
        { key: 'maxHealthMod', label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Max health` },
        { key: 'maxManaMod', label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Max max mana` },
        { key: 'pAtkMod', label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Physical attack` },
        { key: 'mAtkMod', label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Magical attack` },
        { key: 'pDefMod', label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Physical defense` },
        { key: 'mDefMod', label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Magical defense` },
        { key: 'speedMod', label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Speed` },
        { key: 'dodgeMod', label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Dodge chance` },
        { key: 'critChanceMod', label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Critical chance` },
        { key: 'critPowerMod', label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Critical power` },
        { key: 'bleeding', label: 'Bleeding' },
        { key: 'poison', label: 'Poison' },
        { key: 'paralyzed', label: 'Paralyzed' },
        { key: 'healthReg', label: 'HP Regeneration' },
    ];

    return (
        <div className={style.statusWrapper}>
            <hr />
            {statuses.map((status) => (
                <div key={generateRandomId()}>
                    {statusModifiers.map(({ key, label }) =>
                        status[key] ? (
                            <p key={generateRandomId()}>
                                {typeof label === 'string' ? label : label(+status[key])} ({status.duration} turns)
                            </p>
                        ) : null,
                    )}
                </div>
            ))}
        </div>
    );
};
