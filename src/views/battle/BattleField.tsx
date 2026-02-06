import { BattleCharacter, BattleMoveResult } from '../../common/api/.generated';
import { throttle } from '../../common/utils';
import { BattleCharacterComponent } from './BattleCharacterComponent';
import style from './BattleComponent.module.scss';

type BattleFieldProps = {
    party: BattleCharacter[];
    enemies: BattleCharacter[];
    selectedCharacterId?: string;
    characterCommandTargetId?: string;
    defaultTargetId?: string;
    animatedSkill?: BattleMoveResult;
    onCharacterSelect: (character: BattleCharacter) => void;
};

export const BattleField = ({
    party,
    enemies,
    selectedCharacterId,
    characterCommandTargetId,
    defaultTargetId,
    animatedSkill,
    onCharacterSelect,
}: BattleFieldProps) => (
    <div className={style.fieldWrapper}>
        <div className={style.alliesWrapper}>
            {party.map((character) => (
                <BattleCharacterComponent
                    key={character.id}
                    character={character}
                    isSelected={selectedCharacterId === character.id}
                    isTargeted={characterCommandTargetId === character.id}
                    animatedSkill={animatedSkill}
                    onClick={throttle(() => onCharacterSelect(character), 100)}
                />
            ))}
        </div>
        <div className={style.enemiesWrapper}>
            {enemies.map((enemy) => (
                <BattleCharacterComponent
                    key={enemy.id}
                    character={enemy}
                    isSelected={selectedCharacterId === enemy.id}
                    isTargeted={characterCommandTargetId === enemy.id}
                    isDefaultTargeted={!animatedSkill && defaultTargetId === enemy.id}
                    animatedSkill={animatedSkill}
                    onClick={throttle(() => onCharacterSelect(enemy), 100)}
                />
            ))}
        </div>
    </div>
);
