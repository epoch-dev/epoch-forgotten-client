import style from './ItemComponent.module.scss';
import { CharacterClass, ItemDto, ItemRarity, ItemType } from '../../common/api/.generated';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';

export const ItemComponent = ({ item }: { item: ItemDto }) => {
    return (
        <TooltipComponent hint={renderTooltip({ item })} config={{ width: '16rem' }}>
            <img src={AssetsService.getItemUri(item.imageUri)} alt={item.label} draggable={false} />
        </TooltipComponent>
    );
};

const renderTooltip = ({ item }: { item: ItemDto }) => {
    const getRarityLabel = (rarity: ItemRarity) => {
        return <div className={`${style.rarityLabel} ${rarity.toLowerCase()}`}>{item.rarity}</div>;
    };

    const getTypeLabel = (type: ItemType) => {
        switch (type) {
            case 'OneHanded': {
                return 'One-handed';
            }
            case 'TwoHanded': {
                return 'Two-handed';
            }
            case 'Head': {
                return 'Helmet';
            }
            case 'Legs': {
                return 'Footwear';
            }
            case 'Torso': {
                return 'Armor';
            }
            default: {
                return type;
            }
        }
    };

    const getNumberLabel = (value?: number) => {
        if (!value) {
            return <></>;
        }
        if (value > 0) {
            return <b>{`+ ${value} `}</b>;
        }
        if (value < 0) {
            return <b>{`- ${Math.abs(value)} `}</b>;
        }
    };

    const getClassLabel = (classes: CharacterClass[]) => classes.join(', ');

    return (
        <section className={style.itemTooltip}>
            <p className="subtitle">{item.label}</p>
            {getRarityLabel(item.rarity)}

            <hr />

            <p>
                Type: <b>{getTypeLabel(item.type)}</b>
            </p>
            <p>
                Weight: <b>{item.weight}</b>
            </p>

            {item.stats && <hr />}

            {item.stats?.pAtk && <p>{getNumberLabel(item.stats.pAtk)} P. Attack</p>}
            {item.stats?.mAtk && <p>{getNumberLabel(item.stats.mAtk)} M. Attack</p>}
            {item.stats?.pDef && <p>{getNumberLabel(item.stats.pDef)} P. Defense</p>}
            {item.stats?.mDef && <p>{getNumberLabel(item.stats.mDef)} M. Defense</p>}
            {item.stats?.health && <p>{getNumberLabel(item.stats.health)} Health</p>}
            {item.stats?.mana && <p>{getNumberLabel(item.stats.mana)} Mana</p>}
            {item.stats?.allAttrs && <p>{getNumberLabel(item.stats.allAttrs)} All Attributes</p>}
            {item.stats?.str && <p>{getNumberLabel(item.stats.str)} Strength</p>}
            {item.stats?.dex && <p>{getNumberLabel(item.stats.dex)} Dexterity</p>}
            {item.stats?.poi && <p>{getNumberLabel(item.stats.poi)} Poi</p>}
            {item.stats?.arc && <p>{getNumberLabel(item.stats.poi)} Arcana</p>}

            <hr />

            {item.reqLvl && <p>Required level: {item.reqLvl}</p>}
            {item.reqClass && <p>Required class: {getClassLabel(item.reqClass)}</p>}

            {item.description && (
                <p>
                    <br />
                    <i>{item.description}</i>
                </p>
            )}
        </section>
    );
};
