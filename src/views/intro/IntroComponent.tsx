import style from './IntroComponent.module.scss';
import { CharactersClient } from '../../common/api/client';
import { useState } from 'react';
import { useGameStore } from '../game/GameStore';
import { ToastService } from '../../common/services/ToastService';
import { GameView } from '../game/types';
import { ScenesService } from '../scenes/ScenesService';

export const IntroComponent = () => {
    const [name, setName] = useState('');
    const { setView } = useGameStore();

    const handleNameChoice = async () => {
        await Promise.all([CharactersClient.createMainCharacter({ name }), ScenesService.initialize()]);
        ToastService.success({ message: 'Let the journey begin' });
        setView(GameView.World);
    };

    return (
        <section className={style.introWrapper}>
            <b className="title">You are about to start a new journey</b>
            <p></p>
            <div>
                <p className="subtitle">
                    A young man, having just completed his rigorous guardian training, finds himself thrust
                    into a dire situation. A sudden surge in aggression from a pack of wild Gray Wolves has
                    left a trail of devastation, claiming the lives of numerous farm animals. Fearing for
                    their livelihoods, the local farmers rally together, pooling their resources to hire
                    someone capable of quelling this menacing threat.
                </p>
                <p className="subtitle">
                    Amidst the turmoil, the young man's thoughts turn to his childhood friend, Nikka. A
                    skilled huntress known for her unmatched prowess with a bow, Nikka has always been a
                    steadfast companion. As he contemplates the daunting task ahead, he knows he cannot face
                    it alone. With resolve in his heart, he sets out to convince Nikka to join him in this
                    perilous endeavor, for he knows her aid will be crucial in overcoming the challenges that
                    lie ahead. Yet, he is keenly aware that convincing Nikka may not be easy, as her old
                    resentments towards him for choosing the path of a warrior-artist instead of a true
                    warrior still linger.
                </p>
            </div>
            <div>
                <figure className={style.figureWrapper}>
                    <img src="./images/story/story-0-1.png" alt="" />
                    <p className="subtitle">
                        An adventurer, warrior, and musician, he embodies a unique blend of courage, strength,
                        and creativity. Raised in the tranquil village of Vivinra, he have honed his skills
                        through years of diligent training and exploration. Now, their journey takes a new
                        turn as there seems to be something mysterious hiding behind wolves activity. With
                        determination etched into their every step, he stand ready to face whatever challenges
                        lie ahead..
                    </p>
                </figure>
                <fieldset>
                    <label htmlFor="username" className="formLabel">
                        What name shall this hero bear?
                    </label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        type="text"
                        autoComplete="off"
                        className="formInput"
                        minLength={3}
                        maxLength={12}
                    />
                    <button onClick={handleNameChoice} className={`formSubmitBtn ${style.confirmBtn}`}>
                        Confirm
                    </button>
                </fieldset>
            </div>
        </section>
    );
};
