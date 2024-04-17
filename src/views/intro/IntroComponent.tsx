import style from './IntroComponent.module.scss';
import { CharactersClient } from '../../common/api/client';
import { useState } from 'react';
import { useGameStore } from '../game/GameStore';
import { ToastService } from '../../common/services/ToastService';
import { GameView } from '../game/types';

export const IntroComponent = () => {
    const [name, setName] = useState('');
    const { setView } = useGameStore();

    const handleNameChoice = async () => {
        await CharactersClient.recruitMainCharacter({ name });
        ToastService.success({ message: 'Let the journey begin' });
        setView(GameView.World);
    };

    return (
        <section className={style.introWrapper}>
            <p className="title">You are about to start a new journey</p>
            <p></p>
            <div>
                <p className="subtitle">
                    Young man Will has successfully completed his guardian training. However, a sudden
                    increase in aggression from a pack of wild Gray Wolves has resulted in the deaths of
                    numerous farm animals. In response, the local farmers have raised funds to hire someone
                    capable of putting an end to this threat.
                    <br />
                    ...
                </p>
                <p className="subtitle">
                    While dealing with the wolves, Will makes a startling discovery - they are being led by a
                    mysterious Azure Wolf, never seen before. To unravel this mystery, he decides to embark on
                    a journey to the City of Scientists
                </p>
            </div>
            <div>
                <p className="subtitle">An adventurer, warrior and musician</p>
                <fieldset>
                    <label htmlFor="username" className="formLabel">
                        The main character will be called
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
