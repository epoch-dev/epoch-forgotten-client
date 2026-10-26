import { AssetsService } from '../../common/services/AssetsService';
import type { JsonObject } from '../../content/types';
import style from './ContentLabComponent.module.scss';

const readString = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);

export const PreviewCharacterCard = ({ definition }: { definition: JsonObject }) => (
    <article className={style.contentLabCard}>
        <img src={AssetsService.getCharacterUri(readString(definition.imageUri))} alt={readString(definition.label, definition.id as string)} />
        <h3>{readString(definition.label, readString(definition.id))}</h3>
        <p>{readString(definition.title)}</p>
        <p>Class: {readString(definition.class)}</p>
        <p>Race: {readString(definition.race)}</p>
        <p>Size: {String(definition.size ?? '')}</p>
    </article>
);

export const PreviewEnemyCard = ({ definition }: { definition: JsonObject }) => (
    <article className={style.contentLabCard}>
        <img src={AssetsService.getEnemyUri(readString(definition.imageUri))} alt={readString(definition.label)} />
        <h3>{readString(definition.label)}</h3>
        <p>Level {String(definition.level ?? '')}</p>
    </article>
);

export const PreviewItemCard = ({ definition }: { definition: JsonObject }) => (
    <article className={style.contentLabCard}>
        <img src={AssetsService.getItemUri(readString(definition.imageUri))} alt={readString(definition.label)} />
        <h3>{readString(definition.label)}</h3>
        <p>{readString(definition.rarity)} {readString(definition.type)}</p>
        <p>Price: {String(definition.price ?? '')}</p>
    </article>
);

export const PreviewSkillCard = ({ definition }: { definition: JsonObject }) => (
    <article className={style.contentLabCard}>
        <img src={AssetsService.getSkillUri(readString(definition.imageUri))} alt={readString(definition.label)} />
        <h3>{readString(definition.label)}</h3>
        <p>Mana: {String(definition.manaCost ?? '')}</p>
    </article>
);

export const PreviewClassCard = ({ definition }: { definition: JsonObject }) => (
    <article className={style.contentLabCard}>
        <h3>{readString(definition.class)}</h3>
        <p>Tree: {Array.isArray(definition.skillTree) ? definition.skillTree.length : 0} skills</p>
    </article>
);
