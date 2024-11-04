import { useState } from 'react';
import { MusicService } from '../../common/services/MusicService';
import style from './AuthComponent.module.scss';
import SigninFormComponent from './SigninFormComponent';
import SignupFormComponent from './SignupFormComponent';
import { TooltipComponent } from '../../common/components/TooltipComponent';
import { AssetsService } from '../../common/services/AssetsService';
import { Roadmap } from '../../common/components/Roadmap';

const musicService = MusicService.getInstance();
const particlesCount = Array.from({ length: 125 }, (_, index) => index + 1);

enum ViewMode {
    Signin,
    Signup,
}

export const AuthComponent = () => {
    const [view, setView] = useState(ViewMode.Signin);
    const [showRoadmap, setShowRoadmap] = useState(false);

    musicService.mainTheme();

    const toggleViewMode = () => {
        if (view === ViewMode.Signin) {
            setView(ViewMode.Signup);
        } else {
            setView(ViewMode.Signin);
        }
    };

    return (
        <>
            <main className={style.formWrapper}>
                <div onClick={() => setShowRoadmap((prev) => !prev)} className={style.roadmapIcon}>
                    <TooltipComponent hint="Roadmap" config={{ top: '0', left: '5%' }}>
                        <img src={AssetsService.getIcon('ROADMAP')} alt="roadmap" width={32} height={32} />
                    </TooltipComponent>
                </div>
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
            {showRoadmap && <Roadmap onClose={() => setShowRoadmap(false)} />}
        </>
    );
};

export default AuthComponent;
