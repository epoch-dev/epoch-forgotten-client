import style from './EquipmentComponent.module.scss';
import { useEffect, useState } from 'react';
import { useGameStore } from '../game/GameStore';
import { charactersClient } from '../../common/api/client';
import { CharacterEquipItemDtoTargetEnum, ItemDto, ItemType } from '../../common/api/.generated';
import { GameView } from '../game/types';
import { AssetsService } from '../../common/services/AssetsService';
import { EquipmentSelectionComponent, EquipmentSelectionComponentProps } from './EquipmentSelectionComponent';
import { ItemComponent } from './ItemComponent';

export const EquipmentComponent = () => {
    const { character, setCharacter, setView } = useGameStore();
    const [eqSelectionData, setEqSelectionData] = useState<EquipmentSelectionComponentProps | undefined>();

    useEffect(() => {
        void fetchEquipment();
    }, []);

    if (!character) {
        setView(GameView.Party);
        return <></>;
    }

    const fetchEquipment = async () => {
        const characterData = await charactersClient.getDetail(character.id);
        setCharacter(characterData.data);
    };

    const showEquipmentSelection = (
        itemLabel: string,
        types: ItemType[],
        currentItem?: ItemDto,
        target?: CharacterEquipItemDtoTargetEnum,
    ) => {
        setEqSelectionData({
            currentItem,
            types,
            target: target ?? 'Default',
            itemLabel,
            onClose: () => {
                setEqSelectionData(undefined);
            },
        });
    };

    const getEquipmentWeight = () =>
        [
            character.equipment.head,
            character.equipment.charm,
            character.equipment.leftArm,
            character.equipment.rightArm,
            character.equipment.torso,
            character.equipment.legs,
        ]
            .map((e) => e?.weight ?? 0)
            .reduce((sum, curr) => sum + curr, 0);

    return (
        <section style={{ display: 'flex', justifyContent: 'space-between' }}>
            {eqSelectionData && <EquipmentSelectionComponent {...eqSelectionData} />}
            <div className={style.characterWrapper}>
                <h2>
                    {character.name} | {character.level}
                </h2>
                <img
                    src={AssetsService.getCharacterUri(character.imageUri)}
                    alt={character.name}
                    draggable={false}
                />
                <p className={style.statisticLabel}>
                    P. Attack: <b>{character.statistics.pAtk}</b>
                </p>
                <p className={style.statisticLabel}>
                    M. Attack: <b>{character.statistics.mAtk}</b>
                </p>
                <p className={style.statisticLabel}>
                    P. Defense: <b>{character.statistics.pDef}</b>
                </p>
                <p className={style.statisticLabel}>
                    M. Defense: <b>{character.statistics.mDef}</b>
                </p>
                <hr />
                <p className={style.statisticLabel}>
                    Speed: <b>{character.statistics.speed}</b>
                </p>
                <p className={style.statisticLabel}>
                    Dodge Chance: <b>{100 * character.statistics.dodgeChance}%</b>
                </p>
                <hr />
                <p className={style.statisticLabel}>
                    Critical Chance: <b>{100 * character.statistics.critChance}%</b>
                </p>
                <p className={style.statisticLabel}>
                    Critical Power: <b>{100 * character.statistics.critPower}%</b>
                </p>
            </div>

            <div className={style.equipmentWrapper}>
                <div className={style.equipmentHeaderWrapper}>
                    <h2>Equipment |</h2>
                    <div onClick={() => setView(GameView.Skills)}>
                        <img
                            src={AssetsService.getIcon('SKILLS')}
                            style={{ width: '1.6rem' }}
                            draggable={false}
                        />
                    </div>
                </div>
                <div className={style.itemsWrapper}>
                    <div
                        onClick={() => showEquipmentSelection('Charm', ['Charm'], character.equipment.charm)}
                        className={style.equipmentItem}
                        style={{ width: '2rem', height: '2rem' }}>
                        {character.equipment.charm ? (
                            <ItemComponent item={character.equipment.charm} />
                        ) : (
                            <img src={AssetsService.getIcon('BLANK')} />
                        )}
                    </div>
                    <div
                        onClick={() => showEquipmentSelection('Helmet', ['Head'], character.equipment.head)}
                        className={style.equipmentItem}
                        style={{ gridRow: 1, gridColumn: 2 }}>
                        {character.equipment.head ? (
                            <ItemComponent item={character.equipment.head} />
                        ) : (
                            <img src={AssetsService.getIcon('BLANK')} />
                        )}
                    </div>
                    <div
                        onClick={() =>
                            showEquipmentSelection(
                                'Weapon',
                                ['OneHanded', 'TwoHanded'],
                                character.equipment.leftArm,
                                'Left',
                            )
                        }
                        className={style.equipmentItem}
                        style={{ gridRow: 2, gridColumn: 1 }}>
                        {character.equipment.leftArm ? (
                            <ItemComponent item={character.equipment.leftArm} />
                        ) : (
                            <img src={AssetsService.getIcon('BLANK')} />
                        )}
                    </div>
                    <div
                        onClick={() => showEquipmentSelection('Armor', ['Torso'], character.equipment.torso)}
                        className={style.equipmentItem}
                        style={{ gridRow: 2, gridColumn: 2 }}>
                        {character.equipment.torso ? (
                            <ItemComponent item={character.equipment.torso} />
                        ) : (
                            <img src={AssetsService.getIcon('BLANK')} />
                        )}
                    </div>
                    <div
                        onClick={() =>
                            showEquipmentSelection(
                                'Weapon',
                                ['OneHanded', 'TwoHanded'],
                                character.equipment.rightArm,
                                'Right',
                            )
                        }
                        className={style.equipmentItem}
                        style={{ gridRow: 2, gridColumn: 3 }}>
                        {character.equipment.rightArm ? (
                            <ItemComponent item={character.equipment.rightArm} />
                        ) : (
                            <img src={AssetsService.getIcon('BLANK')} />
                        )}
                    </div>
                    <div
                        onClick={() => showEquipmentSelection('Footwear', ['Legs'], character.equipment.legs)}
                        className={style.equipmentItem}
                        style={{ gridRow: 3, gridColumn: 2 }}>
                        {character.equipment.legs ? (
                            <ItemComponent item={character.equipment.legs} />
                        ) : (
                            <img src={AssetsService.getIcon('BLANK')} />
                        )}
                    </div>
                </div>
                <p className={style.statisticLabel} style={{ marginTop: '2rem' }}>
                    Weight: <b>{getEquipmentWeight()}</b>
                </p>
            </div>
        </section>
    );
};
