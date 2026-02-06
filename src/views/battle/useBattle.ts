import { KeyboardEvent, useEffect, useState } from 'react';
import {
    BattleCharacter,
    BattleDefeatResults,
    BattleDto,
    BattleMoveCommand,
    BattleMoveResult,
    BattleSkill,
    BattleTurnResultDto,
    BattleVictoryRewards,
    SceneDataDto,
} from '../../common/api/.generated';
import { battleClient } from '../../common/api/client';
import { GameView } from '../game/types';
import { useGameStore } from '../game/GameStore';
import { wait } from '../../common/utils';
import { ScenesService } from '../scenes/ScenesService';
import { AssetsService } from '../../common/services/AssetsService';
import { MusicService } from '../../common/services/MusicService';
import { SoundService } from '../../common/services/SoundService';
import { ToastService } from '../../common/services/ToastService';

const ANIMATION_TIME_MS = 1000;
const SKILL_SLOT_COUNT = 4;
const musicService = MusicService.getInstance();
const soundService = SoundService.getInstance();

type BattleCommand = Omit<BattleMoveCommand, 'targetId'> & { targetId?: string };

export const useBattle = () => {
    const { setView } = useGameStore();
    const [battleAssets, setBattleAssets] =
        useState<Partial<Pick<BattleDto, 'battleImageUri' | 'battleMusicUri'>>>();
    const [scene, setScene] = useState<SceneDataDto | undefined>();
    const [party, setParty] = useState<BattleCharacter[]>([]);
    const [enemies, setEnemies] = useState<BattleCharacter[]>([]);
    const [canEscape, setCanEscape] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<BattleCharacter | undefined>();
    const [selectedSkill, setSelectedSkill] = useState<BattleSkill | undefined>();
    const [defaultTargetId, setDefaultTargetId] = useState<string>();
    const [commands, setCommands] = useState<BattleCommand[]>([]);
    const [animatedSkill, setAnimatedSkill] = useState<BattleMoveResult | undefined>();
    const [victoryResults, setVictoryResults] = useState<BattleVictoryRewards | undefined>();
    const [defeatResults, setDefeatResults] = useState<BattleDefeatResults | undefined>();

    const characterCommand = commands.find((c) => c.characterId === selectedCharacter?.id);

    const hint =
        victoryResults || defeatResults
            ? ''
            : !selectedCharacter
            ? 'Select character'
            : !selectedSkill
            ? 'Select skill'
            : 'Select target';

    useEffect(() => {
        void loadScene();
        void loadBattle();
    }, []);

    useEffect(() => {
        if (scene && battleAssets) {
            musicService.play(
                battleAssets.battleMusicUri ?? scene.battleMusicUri,
                !battleAssets.battleMusicUri,
            );
        }
    }, [scene, battleAssets]);

    const loadScene = async () => {
        const sceneData = await ScenesService.getSceneData();
        setScene(sceneData);
    };

    const loadBattle = async () => {
        try {
            const battleData = await battleClient.loadBattle();
            if (battleData.data.finished) {
                setView(GameView.World);
                return;
            }

            const party = battleData.data.state.characters.filter((c) => c.isControlled);
            const enemies = battleData.data.state.characters.filter((c) => !c.isControlled);
            const defaultTargetId = enemies.find((e) => e.isAlive)?.id;
            const commands: BattleCommand[] = party.map((character) => {
                const skill = character.skills[1];
                return { characterId: character.id, skillName: skill.name };
            });

            if (!defaultTargetId) {
                setView(GameView.World);
                return;
            }

            setBattleAssets({ ...battleData.data });
            setParty(party);
            setEnemies(enemies);
            setCanEscape(battleData.data.canEscape);
            setDefaultTargetId(defaultTargetId);
            setCommands(commands);
        } catch {
            setView(GameView.World);
        }
    };

    const handleSkillSelection = (skill: BattleSkill) => {
        if (!selectedCharacter?.isAlive) return;
        setSelectedSkill(skill);
        setCommands((prev) =>
            prev.map((cmd) =>
                cmd.characterId === selectedCharacter.id ? { ...cmd, skillName: skill.name } : cmd,
            ),
        );
    };

    const handleCharacterSelection = (target: BattleCharacter) => {
        if (!target.isAlive) return;
        if (!target.isControlled) {
            setDefaultTargetId(target.id);
        }
        if (selectedCharacter && selectedSkill) {
            setCommands((prev) => [
                ...prev.filter((c) => c.characterId !== selectedCharacter.id),
                { characterId: selectedCharacter.id, skillName: selectedSkill.name, targetId: target.id },
            ]);
            setSelectedCharacter(undefined);
            setSelectedSkill(undefined);
        } else if (target.isControlled) {
            setSelectedCharacter(target);
        }
    };

    const updateCharacters = (character: BattleCharacter) => {
        if (character.isControlled) {
            setParty((prev) => prev.map((c) => (c.id === character.id ? character : c)));
        } else {
            setEnemies((prev) => prev.map((c) => (c.id === character.id ? character : c)));
        }
    };

    const handleAttack = async () => {
        setSelectedCharacter(undefined);
        setSelectedSkill(undefined);

        for (const command of commands) {
            const character = party.find((c) => c.id === command.characterId);
            const skill = character?.skills.find((s) => s.name === command.skillName);
            if (!character || !skill) {
                ToastService.error({ message: 'Invalid command' });
                return;
            }
            if (skill.manaCost && character.statistics.mana < skill.manaCost) {
                ToastService.error({ message: `Not enough mana to cast ${skill.label}` });
                return;
            }
        }

        try {
            const filledCommands: BattleMoveCommand[] = commands.map((c) => ({
                ...c,
                targetId: c.targetId ?? defaultTargetId ?? '',
            }));
            const turnResult = await battleClient.continueBattle({ commands: filledCommands });
            await animateTurn(turnResult.data);
            if (turnResult.data.victory) {
                setVictoryResults(turnResult.data.victory);
                soundService.victory();
            }
            if (turnResult.data.defeat) {
                setDefeatResults(turnResult.data.defeat);
                soundService.defeat();
            }
        } catch {
            setView(GameView.World);
        }
    };

    const handleEscape = async () => {
        if (!canEscape) return;

        const result = await battleClient.escapeBattle();
        if (result.data.escaped) {
            ToastService.success({ message: 'Escaped successfully', duration: 1000 });
            return setView(GameView.World);
        }

        ToastService.error({ message: 'Failed to escape', duration: 1000 });
        await animateTurn(result.data);

        if (result.data.defeat) {
            setDefeatResults(result.data.defeat);
            soundService.defeat();
        }
    };

    const animateTurn = async (turnResult: BattleTurnResultDto) => {
        for (const moveResult of turnResult.moveResults) {
            setAnimatedSkill(moveResult);
            const character = [...party, ...enemies].find((c) => c.id === moveResult.characterId)!;
            const skill = character.skills.find((s) => s.label === moveResult.skillLabel);
            character.statistics.mana -= skill?.manaCost ?? 0;
            character.statistics.statuses =
                turnResult.characters.find((c) => c.id === character.id)?.statistics.statuses ?? [];
            moveResult.moveLogs.forEach((log) => {
                const target = [...party, ...enemies].find((c) => c.id === log.targetId)!;
                target.statistics.health -= log.hits.reduce((prev, curr) => prev + curr.value, 0);
                if (target.statistics.health < 0) {
                    target.isAlive = false;
                    target.statistics.statuses = [];
                    setCommands((prev) =>
                        prev.map((c) => (c.targetId === target.id ? { ...c, targetId: undefined } : c)),
                    );
                }
                target.statistics.health = Math.max(
                    0,
                    Math.round(Math.min(target.statistics.health, target.statistics.maxHealth)),
                );
                updateCharacters(target);
            });
            character.statistics.statuses.forEach((status) => {
                if (status.bleeding) character.statistics.health -= status.bleeding;
                else if (status.poison) character.statistics.health -= status.poison;
                else if (status.healthReg) character.statistics.health += status.healthReg;
            });
            if (character.statistics.health <= 0) {
                character.isAlive = false;
                character.statistics.health = 0;
                character.statistics.statuses = [];
            }
            updateCharacters(character);
            await wait(ANIMATION_TIME_MS);
        }
        setAnimatedSkill(undefined);
        setDefaultTargetId(enemies.find((e) => !e.isControlled && e.isAlive)?.id);
    };

    const handleKeyPress = (event: KeyboardEvent) => {
        event.preventDefault();
        if (event.key === 'Escape' || event.key === 'Backspace') {
            setSelectedCharacter(undefined);
            setSelectedSkill(undefined);
        }
    };

    const backgroundImage = scene
        ? `url(${AssetsService.getSceneUri(battleAssets?.battleImageUri ?? scene.battleImageUri)})`
        : undefined;

    const isActionDisabled =
        animatedSkill !== undefined || victoryResults !== undefined || defeatResults !== undefined;

    const activeSkills = selectedCharacter?.skills.filter((s) => s.kind !== 'Passive') ?? [];
    const skillSlots = [...activeSkills, ...Array(Math.max(0, SKILL_SLOT_COUNT - activeSkills.length)).fill(null)];

    return {
        party,
        enemies,
        canEscape,
        selectedCharacter,
        selectedSkill,
        animatedSkill,
        victoryResults,
        defeatResults,
        characterCommand,
        hint,
        backgroundImage,
        isActionDisabled,
        skillSlots,
        defaultTargetId,
        handleSkillSelection,
        handleCharacterSelection,
        handleAttack,
        handleEscape,
        handleKeyPress,
    };
};
