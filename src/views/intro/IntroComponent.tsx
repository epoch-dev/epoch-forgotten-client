import style from './IntroComponent.module.scss';
import { charactersClient } from '../../common/api/client';
import { useState } from 'react';
import { useGameStore } from '../game/GameStore';
import { ToastService } from '../../common/services/ToastService';
import { GameView } from '../game/types';
import { ScenesService } from '../scenes/ScenesService';
import { CharacterClass } from '../../common/api/.generated';
import { TooltipComponent } from '../../common/components/TooltipComponent';

export const IntroComponent = () => {
    const [mainName, setMainName] = useState('');
    const [mainClass, setMainClass] = useState<CharacterClass>(CharacterClass.Mercenary);
    const { setView } = useGameStore();

    const handleNameChoice = async () => {
        if (!mainName.length || !mainClass) {
            return;
        }
        await Promise.all([
            charactersClient.createMainCharacter({ name: mainName, class: mainClass }),
            ScenesService.initialize(),
        ]);
        ToastService.success({ message: 'Let the journey begin' });
        setView(GameView.World);
    };

    return (
        <section className={style.introWrapper}>
            <b className="title dark">You are about to start a new journey</b>
            <p></p>
            <div>
                <p className="subtitle">
                    A young man, having just completed his rigorous guardian training, finds himself thrust
                    into a dire situation. A sudden surge in aggression from a pack of wild Gray Wolves has
                    left a trail of devastation, claiming the lives of numerous farm animals. Fearing for
                    their livelihoods, the local farmers rally together, pooling their resources to hire
                    someone capable of quelling this menacing threat.
                </p>
                <br />
                <p className="subtitle">
                    Amidst the turmoil, the young man's thoughts turn to his childhood friend, Nikka. A
                    skilled huntress known for her unmatched prowess with a bow. As he contemplates the
                    daunting task ahead, he knows he cannot face it alone. Yet, he is keenly aware that
                    convincing Nikka may not be easy, as her old resentments towards him for choosing the path
                    of an artist instead of a true warrior still linger.
                </p>
                <br />
                <p className="subtitle">
                    Raised by a father who was a musician and inventor of instruments, he was trained in
                    combat during his childhood but later moved into music as his father wished. Despite this,
                    his desire for something more has never faded.
                </p>
            </div>
            <div>
                <figure className={style.figureWrapper}>
                    <img src="./images/story/story-0-1.png" alt="" />
                    <p className="subtitle">
                        A guardian and musician, he embodies a unique blend of courage, strength, and
                        creativity. Raised in the tranquil village of Vivinra, he have honed his skills
                        through years of diligent training and exploration. Now, their journey takes a new
                        turn as there seems to be something mysterious hiding behind wolves' activity. With
                        determination etched into their every step, he stand ready to face whatever challenges
                        lie ahead...
                    </p>
                </figure>
                <fieldset>
                    <label htmlFor="username" className="formLabel">
                        What name shall this hero bear?
                    </label>
                    <input
                        value={mainName}
                        onChange={(e) => setMainName(e.target.value)}
                        type="text"
                        autoComplete="off"
                        className="formInput"
                        minLength={3}
                        maxLength={12}
                    />
                </fieldset>
                <fieldset>
                    <legend className="formLabel">Which path will he follow?</legend>
                    <TooltipComponent
                        config={{ width: '14rem' }}
                        hint="A true warrior with hight endurance and power to withstand attacks and deal target multiple enemies.">
                        <input
                            type="radio"
                            value={CharacterClass.Mercenary}
                            checked={mainClass === CharacterClass.Mercenary}
                            onChange={() => setMainClass(CharacterClass.Mercenary)}
                        />
                        <label htmlFor="Mercenary">Mercenary</label>
                    </TooltipComponent>
                    <TooltipComponent
                        config={{ width: '14rem' }}
                        hint="Swift and agile, capable of high single-target damage and mild supportive abilities.">
                        <input
                            type="radio"
                            value={CharacterClass.Hunter}
                            checked={mainClass === CharacterClass.Hunter}
                            onChange={() => setMainClass(CharacterClass.Hunter)}
                        />
                        <label htmlFor="Mercenary">Hunter</label>
                    </TooltipComponent>
                    <TooltipComponent
                        config={{ width: '14rem' }}
                        hint="Neither strong nor agile yet versatile and  proficient with mysterious Arcana powers.">
                        <input
                            type="radio"
                            value={CharacterClass.Arcanist}
                            checked={mainClass === CharacterClass.Arcanist}
                            onChange={() => setMainClass(CharacterClass.Arcanist)}
                        />
                        <label htmlFor="Mercenary">Arcanist</label>
                    </TooltipComponent>
                </fieldset>
                <button onClick={handleNameChoice} className={`formSubmitBtn ${style.confirmBtn}`}>
                    Confirm
                </button>
            </div>
        </section>
    );
};
