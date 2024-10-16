import style from './BattleCharacterComponent.module.scss';
import { BattleCharacter, BattleMoveResult, BattleStatus } from '../../common/api/.generated';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { ProgressBarComponent } from '../../common/components/ProgressBarComponent';
import { formatNumber, generateRandomId } from '../../common/utils';
import { CSS_COLOR } from '../../common/styles';
import { useEffect } from 'react';
import { SoundService } from '../../common/services/SoundService';

const soundService = SoundService.getInstance();

export const BattleCharacterComponent = ({
    character,
    isSelected,
    isTargeted,
    animatedSkill,
    onClick,
}: {
    character: BattleCharacter;
    isSelected: boolean;
    isTargeted: boolean;
    animatedSkill: BattleMoveResult | undefined;
    onClick: () => void;
}) => {
    useEffect(() => {
        if (animatedSkill && animatedSkill.characterId === character.id) {
            soundService.play(`skills/${animatedSkill.skillSoundUri}`);
        }
    }, [animatedSkill]);

    const characterClass = `${style.characterItem} ${character.isControlled ? style.characterAlly : ''} ${
        isTargeted ? style.targetActive : ''
    } ${isSelected ? style.characterActive : ''} ${!character.isAlive ? style.characterDead : ''}`;

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

                    {(character.statistics.statuses.length > 0) && (
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
                {animatedSkill?.characterId === character.id && (
                    <div className={style.logItem}>{animatedSkill.skillLabel}</div>
                )}
                {animatedLog &&
                    animatedLog.hits.map((hit, hitInd) => (
                        <div
                            key={generateRandomId()}
                            className={style.logItem}
                            style={{ animationDelay: `${hitInd / 2}s` }}>
                            <b className={`${hit.value >= 0 ? 'error' : 'success'}`}>
                                {formatNumber(Math.round(Math.abs(hit.value)))}
                                {hit.effectLogs.map((effectLog, effectLogInd) => (
                                    <p key={`el-${effectLogInd}`} className={style.effectLogItem}>
                                        {effectLog}
                                    </p>
                                ))}
                            </b>
                        </div>
                    ))}
                <img src={characterImgUri} alt={character.label} />
                <ProgressBarComponent
                    current={character.statistics.health}
                    max={character.statistics.maxHealth}
                    fillColor={CSS_COLOR.MYTHICAL}
                />
            </div>
        </TooltipComponent>
    );
};

const BattleCharacterStatus = ({ statuses }: { statuses: BattleStatus[] }) => {
    const statusModifiers: { key: keyof BattleStatus; label: string }[] = [
        { key: 'maxHealthMod', label: 'Max health' },
        { key: 'maxManaMod', label: 'Max mana' },
        { key: 'pAtkMod', label: 'Physical attack' },
        { key: 'mAtkMod', label: 'Magical attack' },
        { key: 'pDefMod', label: 'Physical defense' },
        { key: 'mDefMod', label: 'Magical defense' },
        { key: 'speedMod', label: 'Speed' },
        { key: 'dodgeMod', label: 'Dodge' },
        { key: 'critChanceMod', label: 'Critical chance' },
        { key: 'critPowerMod', label: 'Critical power' },
    ];

    return (
        <div className={style.statusWrapper}>
            <hr />
            {statuses.map((status, statusInd) => (
                <div key={`status-${statusInd}`}>
                    {statusModifiers.map(({ key, label }) =>
                        status[key] ? (
                            <p key={key}>
                                {label} +{100 * + status[key]!}% ({status.duration} turns)
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
