import style from './BattleCharacterComponent.module.scss';
import { BattleCharacter, BattleMoveResult, BattleStatus } from '../../common/api/.generated';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { ProgressBarComponent } from '../../common/components/ProgressBarComponent';
import { formatNumber, generateRandomId } from '../../common/utils';
import { CSS_COLOR } from '../../common/styles';
import { useEffect, useState } from 'react';
import { SoundService } from '../../common/services/SoundService';

const soundService = SoundService.getInstance();

const WIDTH_FACTOR = 1.1;
const HEIGHT_FACTOR = 1.3;

export const BattleCharacterComponent = ({
    character,
    isSelected,
    isTargeted,
    isDefaultTargeted,
    animatedSkill,
    onClick,
}: {
    character: BattleCharacter;
    isSelected: boolean;
    isTargeted: boolean;
    isDefaultTargeted?: boolean;
    animatedSkill: BattleMoveResult | undefined;
    onClick: () => void;
}) => {
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (animatedSkill && animatedSkill.characterId === character.id) {
            soundService.play(`skills/${animatedSkill.skillSoundUri}`);
            setAnimating(true);
        } else {
            setAnimating(false);
        }
    }, [animatedSkill]);

    const characterClass = `
        ${style.characterItem} 
        ${character.isControlled ? style.characterAlly : ''}
        ${isTargeted ? style.targetActive : ''} 
        ${isDefaultTargeted ? style.targetDefaultActive : ''} 
        ${isSelected ? style.characterActive : ''} 
        ${!character.isAlive ? style.characterDead : ''}
        ${animating && (character.isControlled ? style.allyAttacking : style.enemyAttacking)}`;

    const characterImgUri = character.isControlled
        ? AssetsService.getCharacterUri(character.imageUri)
        : AssetsService.getEnemyUri(character.imageUri);

    const animatedLog = animatedSkill?.moveLogs.find((log) => log.targetId === character.id);

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
            <div
                onClick={onClick}
                className={characterClass}
                style={{
                    width: `${WIDTH_FACTOR * character.size}px`,
                    height: `${HEIGHT_FACTOR * character.size}px`,
                }}>
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
                {animatedLog &&
                    animatedLog.hits.map((hit, hitIndex) => (
                        <div
                            key={generateRandomId()}
                            className={style.logItem}
                            style={{ animationDelay: `${hitIndex / 2}s` }}>
                            <b className={`${hit.value >= 0 ? 'error' : 'success'}`}>
                                {formatNumber(Math.round(Math.abs(hit.value)))}
                                {hit.effectLogs.map((effectLog) => (
                                    <p key={generateRandomId()} className={style.effectLogItem}>
                                        {effectLog}
                                    </p>
                                ))}
                            </b>
                        </div>
                    ))}
                <img
                    src={characterImgUri}
                    alt={character.label}
                    style={{ animationDuration: `${character.size / 20}s` }}
                />
                <ProgressBarComponent
                    current={character.statistics.health}
                    max={character.statistics.maxHealth}
                    fillColor={CSS_COLOR.MYTHICAL}
                />
                {character.isControlled && (
                    <ProgressBarComponent
                        current={character.statistics.mana}
                        max={character.statistics.maxMana}
                        fillColor={CSS_COLOR.RARE}
                        style={{ width: '80%', height: '0.4rem' }}
                    />
                )}
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
        {
            key: 'critChanceMod',
            label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Critical chance`,
        },
        {
            key: 'critPowerMod',
            label: (amount: number) => `${amount > 0 ? '+' : ''}${amount} Critical power`,
        },
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
                                {typeof label === 'string' ? label : label(+status[key])} ({status.duration}{' '}
                                turns)
                            </p>
                        ) : (
                            <></>
                        ),
                    )}
                </div>
            ))}
        </div>
    );
};
