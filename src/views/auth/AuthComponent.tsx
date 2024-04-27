import style from './AuthComponent.module.scss';
import { useState } from 'react';
import SigninFormComponent from './SigninFormComponent';
import SignupFormComponent from './SignupFormComponent';

const particlesCount = Array.from({ length: 125 }, (_, index) => index + 1);

enum ViewMode {
    Signin,
    Signup,
}

export const AuthComponent = () => {
    const [view, setView] = useState(ViewMode.Signin);

    const toggleViewMode = () => {
        view === ViewMode.Signin ? setView(ViewMode.Signup) : setView(ViewMode.Signin);
    };

    return (
        <>
            <main className={style.formWrapper}>
                <figure className={style.logoWrapper}>
                    <img src="./images/brand/brand.png" alt="logo" />
                    <h2 className="title">Epoch Forgotten</h2>
                </figure>
                {view === ViewMode.Signin && <SigninFormComponent />}
                {view === ViewMode.Signup && <SignupFormComponent />}
                <p className="subtitle" style={{ marginTop: '-0.5rem' }}>
                    or
                </p>
                <button onClick={toggleViewMode} type="button" className={`formSubmitBtn ${style.viewBtn}`}>
                    {view === ViewMode.Signin ? 'Start New Journey' : 'Signin'}
                </button>
            </main>
            <div style={{ position: 'absolute', zIndex: 1 }}>
                {particlesCount.map((index) => (
                    <div className={style.particleWrapper} key={index}>
                        <div className={style.particleItem}></div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default AuthComponent;
