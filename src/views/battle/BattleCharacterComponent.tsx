import style from './BattleCharacterComponent.module.scss';
import { BattleCharacter, BattleMoveResult } from '../../common/api/.generated';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { ProgressBarComponent } from '../../common/components/ProgressBarComponent';
import { generateRandomId } from '../../common/utils';
import { CSS_COLOR } from '../../common/styles';
import { useEffect, useMemo } from 'react';
import { SoundService } from '../../common/services/SoundService';

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
    const soundService = useMemo(() => SoundService.getInstance(), []);

    useEffect(() => {
        if (animatedSkill && animatedSkill.characterId === character.id) {
            soundService.play(`skills/${animatedSkill.skillSoundUri}`);
        }
    }, [animatedSkill]);

    const characterClass = `${style.characterItem} ${isTargeted ? style.targetActive : ''} ${
        isSelected ? style.characterActive : ''
    } ${!character.isAlive ? style.characterDead : ''}`;

    const characterImgUri = character.isControlled
        ? AssetsService.getCharacterUri(character.imageUri)
        : AssetsService.getEnemyUri(character.imageUri);

    const animatedLog = animatedSkill?.moveLogs.find((log) => log.targetId === character.id);

    return (
        <TooltipComponent
            hint={
                <div className={style.statusItem}>
                    <p className="subtitle">{character.label}</p>

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
                            <b
                                className={`${hit.value >= 0 ? 'error' : 'success'} ${
                                    hit.isCritical ? style.logItemCritical : ''
                                } ${hit.dodged ? style.logItemDodged : ''}`}>
                                {hit.dodged ? 'Dodged' : Math.round(Math.abs(hit.value))}
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
