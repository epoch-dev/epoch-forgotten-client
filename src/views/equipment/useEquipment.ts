import { useEffect, useState } from 'react';
import { useGameStore } from '../game/GameStore';
import { charactersClient } from '../../common/api/client';
import { CharacterEquipItemDtoTargetEnum, ItemDto, ItemType } from '../../common/api/.generated';
import { GameView } from '../game/types';
import { EquipmentSelectionComponentProps } from './EquipmentSelectionComponent';

export const useEquipment = () => {
    const { character, setCharacter, setView } = useGameStore();
    const [eqSelectionData, setEqSelectionData] = useState<EquipmentSelectionComponentProps | undefined>();

    useEffect(() => {
        if (!character) {
            setView(GameView.Party);
            return;
        }
        void fetchEquipment();
    }, []);

    const fetchEquipment = async () => {
        if (!character) return;
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

    const getEquipmentWeight = () => {
        if (!character) return 0;
        return [
            character.equipment.head,
            character.equipment.charm,
            character.equipment.leftArm,
            character.equipment.rightArm,
            character.equipment.torso,
            character.equipment.legs,
        ]
            .map((e) => e?.weight ?? 0)
            .reduce((sum, curr) => sum + curr, 0);
    };

    return {
        character,
        eqSelectionData,
        showEquipmentSelection,
        getEquipmentWeight,
        setView,
    };
};
